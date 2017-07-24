import Reflux from 'reflux'
import Task from './task'
import Actions from '../actions'

class TaskQueue extends Reflux.Store {
    constructor() {
        super()

        this._queue = []
        this._completed = []
        this._currentSequentialId = Date.now()

        this.listenTo(Actions.queueTask, this.enqueue)
        this.listenTo(Actions.queueTasks, (tasks) => {
            if(!(tasks && tasks.length>0)) return

            tasks.forEach((t) => this.enqueue(t))
        })
    }

    queue = () => this._queue

    enqueue = (task) => {
        if (!(task instanceof Task))
            throw new Error('You must queue a `Task` instance')

        if (!task.id)
            throw new Error('Tasks must have an ID prior to being queued. Check that your Task constructor is calling `super`')

        if (!task.queueState)
            throw new Error('Tasks must have a queueState prior to being queued. Check that your Task constructor is calling `super`')

        task.sequentialId == ++this._currentSequentialId

        this._dequeueObsoleteTasks(task)

        task.runLocal().then(() => {
            this._queue.push(task)
            this._updateSoon()
        })
    }

    _dequeueObsoleteTasks = (task) => {
        const obsolete = _.filter(this._queue, (otherTask) => {
            // Do not interrupt tasks which are currently processing
            if (otherTask.queueState.isProcessing) return false

            // Do not remove ourselves from the queue
            if (otherTask === task) return false

            // Dequeue tasks which our new task indicates it makes obsolete
            return task.shouldDequeueOtherTask(otherTask)
        })

        for (const otherTask of obsolete) {
            otherTask.queueState.status = Task.Status.Continue
            otherTask.queueState.debugStatus = Task.DebugStatus.DequeuedObsolete
            this.dequeue(otherTask)
        }
    }

    dequeue = (taskOrId) => {
        const task = this._resolveTaskArgument(taskOrId)

        if (!task)
            throw new Error('Couldn\'t find task in queue to dequeue')

        if (task.queueState.isProcessing) {

            // We cannot remove a task from the queue while it's running and pretend
            // things have stopped. Ask the task to cancel. It's promise will resolve
            // or reject, and then we'll end up back here.
            task.cancel()
        } else {

            this._queue.splice(this._queue.indexOf(task), 1)
            this._completed.push(task)
            if (this._completed.length > 1000) this._completed.shift()
            this._updateSoon()
        }
    }

    _resolveTaskArgument = (taskOrId) => {
        if (!taskOrId) return null
        else if (taskOrId instanceof Task)
            return _.find(this._queue, (task) => task === taskOrId)
        else
            return _.findWhere(this._queue, {id: taskOrId})
    }


    _updateSoon = () => {
        if (!this._updateSoonThrottled) {
            this._updateSoonThrottled = _.throttle(() => {
                    this._processQueue()
                    this._ensurePeriodicUpdates()
                }
                , 10)
        }

        this._updateSoonThrottled()
    }

    _processQueue = () => {
        let started = 0

        if (this._processQueueTimeout) {
            clearTimeout(this._processQueueTimeout)
            this._processQueueTimeout = null
        }

        const now = Date.now()
        let reprocessIn = Number.MAX_VALUE


        for (let i = this._queue.length-1; i >= 0; i-=1) {
            const task = this._queue[i]
            if (this._taskIsBlocked(task)) {
                task.queueState.debugStatus = Task.DebugStatus.WaitingOnDependency
                continue
            }

            if (task.queueState.retryAfter && task.queueState.retryAfter > now) {
                reprocessIn = Math.min(task.queueState.retryAfter - now, reprocessIn)
                task.queueState.debugStatus = Task.DebugStatus.WaitingToRetry
                continue
            }

            this._processTask(task)
            started += 1
        }


        if (started > 0)
            this.trigger()

        if (reprocessIn != Number.MAX_VALUE)
            this._processQueueTimeout = setTimeout(this._processQueue, reprocessIn + 500)
    }

    _processTask = (task) => {
        if (task.queueState.isProcessing) return

        task.queueState.isProcessing = true
        task.runRemote()
            .finally(() => {

                task.queueState.isProcessing = false
                this.trigger()
            })
            .then((status) => {

                if (status == Task.Status.Retry) {
                    task.queueState.retryDelay = Math.round(Math.min((task.queueState.retryDelay || 1000) * 1.2, 30000))
                    task.queueState.retryAfter = Date.now() + task.queueState.retryDelay
                } else {

                    this.dequeue(task)
                }
                this._updateSoon()
            })
            .catch((err) => {
                this._seenDownstream = {}
                this._notifyOfDependentError(task, err)
                    .then((responses) => {
                        if(responses) {
                            this._dequeueDownstreamTasks(responses)
                            this.dequeue(task)
                        }
                    })
            })

    }

    _ensurePeriodicUpdates = () => {
        const anyIsProcessing = _.any(this._queue, (task) => task.queueState.isProcessing)

        // The task queue triggers periodically as tasks are processed, even if no
        // major events have occurred. This allows tasks which have state, like
        // SendDraftTask.progress to be propogated through the app and inspected.
        if (anyIsProcessing && !this._updatePeriodicallyTimeout) {
            this._updatePeriodicallyTimeout = setInterval(() => {
                    this._updateSoon()
                }
                , 1000)
        } else if (!anyIsProcessing && this._updatePeriodicallyTimeout) {
            clearTimeout(this._updatePeriodicallyTimeout)
            this._updatePeriodicallyTimeout = null
        }
    }

    _taskIsBlocked = (task) => _.any(this._queue, (otherTask) => task.isDependentOnTask(otherTask) && task != otherTask)

    _tasksDependingOn = (task) => _.filter(this._queue, (otherTask) => otherTask.isDependentOnTask(task) && task != otherTask)


    // Recursively notifies tasks of dependent errors
    _notifyOfDependentError = (failedTask, err) => {
        const downstream = this._tasksDependingOn(failedTask) || []
        return Promise.map(downstream, (downstreamTask) => {
            if (!downstreamTask) return Promise.resolve(null)

            // Infinte recursion check!
            // These will get removed later
            if(this._seenDownstream[downstreamTask.id]) return Promise.resolve(null)
            this._seenDownstream[downstreamTask.id] = true

            const responseHash = Promise.props({
                returnValue: downstreamTask.onDependentTaskError(failedTask, err),
                downstreamTask
            })


            return Promise.all([
                responseHash,
                this._notifyOfDependentError(downstreamTask, err)
            ])
        })

    }

    // When we `_notifyOfDependentError`s, we collect a nested array of
    // responses of the tasks we notified. We need to responses to determine
    // whether or not we should dequeue that task.
    _dequeueDownstreamTasks = (responses = []) => {
        // Responses are nested arrays due to the recursion
        responses = _.flatten(responses)

        // A response may be `null` if it hit our infinite recursion check.
        responses = _.filter(responses, (r) => r != null)

        responses.forEach((resp) => {
            resp.downstreamTask.queueState.status = Task.Status.Continue
            resp.downstreamTask.queueState.debugStatus = Task.DebugStatus.DequeuedDependency
            this.dequeue(resp.downstreamTask)
        })
    }

}

module.exports = new TaskQueue()