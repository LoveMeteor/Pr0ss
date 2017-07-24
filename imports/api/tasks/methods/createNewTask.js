import SimpleSchema from 'simpl-schema'
import { ValidatedMethod } from 'meteor/mdg:validated-method'
import inviteUsers from './inviteUsers'
import sendSlackMessage from './sendSlackMessage'
import { Tasks } from '../../models'

export default new ValidatedMethod({
  name: 'task.create',
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
    },
    parentType: {
      type: String
    }
  }).validator(),
  run(task) {
    if (!this.userId) return
    const { parentId, assignee, approver } = task
    inviteUsers.call({
      parentId,
      taskOperators: [assignee, approver],
    })
    const _id = Tasks.insert(task)
    Meteor.defer(() => {
      sendSlackMessage.call({
        taskId: _id,
        parentId,
        type: 'NEW_TASK',
      })
    })
    return _id
  },
})
