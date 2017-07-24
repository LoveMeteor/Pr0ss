import { ValidatedMethod } from 'meteor/mdg:validated-method'
import SimpleSchema from 'simpl-schema'
import inviteUsers from './inviteUsers'
import { Tasks } from '../../models'
import sendSlackMessage from './sendSlackMessage'

export default new ValidatedMethod({
  name: 'task.update',
  validate: new SimpleSchema({
    name: {
      type: String,
    },
    assignee: {
      type: String,
    },
    approver: {
      type: String,
      optional: true,
    },
    description: {
      type: String,
      optional: true,
    },
    dueDate: {
      type: Date,
    },
    status: {
      type: String,
      allowedValues: [
        'Idea',
        'To-Do',
        'In Progress',
        'Reviewing',
        'Complete',
        'Blocked',
      ],
    },
    parentId: {
      type: String,
      optional: true,
    },
    parentType: {
      type: String,
      optional: true,
    },
    _id: {
      type: String,
    },
  }).validator(),
  run(task) {
    if (!this.userId) return
    const { assignee, approver, parentId } = task
    inviteUsers.call({
      parentId,
      taskOperators: [assignee, approver],
    })
    Tasks.update(task._id, {
      $set: task,
    })
    Meteor.defer(() => {
      sendSlackMessage.call({
        taskId: task._id,
        parentId,
        type: 'UPDATE_TASK',
      })
    })
  },
})
