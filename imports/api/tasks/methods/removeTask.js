import { ValidatedMethod } from 'meteor/mdg:validated-method'
import SimpleSchema from 'simpl-schema'
import { Tasks } from '../../models'
import sendSlackMessage from './sendSlackMessage'

export default new ValidatedMethod({
  name: 'task.remove',
  validate: new SimpleSchema({
    _id: {
      type: String,
    },
  }).validator(),
  run({ _id }) {
    if (!this.userId)
      throw new Meteor.Error('You are not allowed to remove this task')
    Tasks.update(_id, {
      $set: {
        isRemoved: true,
      },
    })
    const task = Tasks.findOne(_id)
    if (task) {
      Meteor.defer(() => {
        sendSlackMessage.call({
          taskId: _id,
          parentId: task.parentId,
          type: 'REMOVE_TASK',
        })
      })
    }
  },
})
