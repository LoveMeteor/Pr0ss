/* global moment */
import React, {Component, PropTypes} from 'react'
import {Panel, Table} from 'react-bootstrap'
import {createContainer} from 'meteor/react-meteor-data'
import Tasks from '/imports/api/models/tasks/tasks'
import {getUserName} from '/imports/api/lib/filters'

class MyTasks extends Component {
    constructor(props) {
        super()
        this.renderTasks = this.renderTasks.bind(this)

        this.state = {
            tasks: props.tasks
        }
    }

    componentWillReceiveProps(newProps) {
        console.log('componentWillReceiveProps')
        const {hideCompletedTasks} = this.state
        this.setState({tasks: hideCompletedTasks ? newProps.tasks.filter(t => t.status !== 'Complete') : newProps.tasks})
    }

    toggleHideCompletedTasks = (e) => {
        const checked = e.target.checked
        this.setState({
            hideCompletedTasks: checked,
            tasks: checked ? this.props.tasks.filter(t => t.status !== 'Complete') : this.props.tasks
        })
    }

    renderTasks() {
        const {tasks} = this.state
        const {users, userId} = this.props

        return tasks.map((task, index) => {
            const assignee = users.filter(u => u._id === task.assignee)[0]
            const assigneeName = assignee ? getUserName(assignee) : ''
            const approver = users.filter(u => u._id === task.approver)[0]
            const approverName = approver ? getUserName(approver) : ''
            const formatedDate = moment(task.dueDate).format('MM/DD/YYYY')
            const isOverDate = moment('MM/DD/YYYY').isBefore(formatedDate)

            return (
                <tr key={task._id}>
                    <td>{index + 1}</td>
                    <td>{task.name}</td>
                    <td>{task.status}</td>
                    <td>{task.parent() && task.parent().name}</td>
                    <td colSpan={2}>{task.description}</td>
                    <td>{assignee && assignee._id === userId ? 'You' : assigneeName}</td>
                    <td>{approver && approver._id === userId ? 'You' : approverName}</td>
                    <td style={{color: isOverDate ? 'red' : ''}}>
                        {formatedDate}
                    </td>
                    <td>
                        <a href={`/${task.parentType}/${task.parentId}`}>View</a>
                    </td>
                </tr>
            )
        })
    }

    render() {
        const header = (
            <div style={{display: 'flex'}}>
                <div style={{flex: 1}}>
                    My Tasks
                </div>
                <div>
                    <input type="checkbox" value={this.state.hideCompletedTasks}
                           onChange={this.toggleHideCompletedTasks}/>&nbsp;Hide Completed Tasks
                </div>
            </div>
        )
        return (
            <div>
                <Panel header={header}>
                    All tasks assigned from/to you.
                    <Table responsive>
                        <thead>
                        <tr>
                            <th>#</th>
                            <th>Name</th>
                            <th>Status</th>
                            <th>Deal/Project</th>
                            <th colSpan={2}>Desciption</th>
                            <th>Assignee</th>
                            <th>Approver</th>
                            <th>DueDate</th>
                            <th></th>
                        </tr>
                        </thead>
                        <tbody>
                        {this.renderTasks()}
                        </tbody>
                    </Table>
                </Panel>
            </div>
        )
    }
}

export default createContainer(() => {
    const userId = Meteor.userId()
    const subscribers = []
    let loading = true
    let tasks = []
    subscribers.push(Meteor.subscribe('task.byUserId'))
    loading = subscribers.reduce((result, subscriber) => result && subscriber.ready(), true)
    tasks = Tasks.find({$or: [{assignee: userId}, {approver: userId}]}).fetch()
    return {
        loading,
        tasks,
        userId,
        users: Meteor.users.find().fetch(),
    }
}, MyTasks)
