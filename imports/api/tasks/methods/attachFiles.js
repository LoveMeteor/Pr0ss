import SimpleSchema from 'simpl-schema'
import { Tasks } from '../../models'
import sendSlackMessage from './sendSlackMessage'
import { ValidatedMethod } from 'meteor/mdg:validated-method'

export default new ValidatedMethod({
  name: 'task.attachFiles',
  validate: new SimpleSchema({
    _id: {
      type: String,
    },
    attachments: {
      type: Array,
    },
    'attachments.$': {
      type: Object,
    },
    'attachments.$._id': {
      type: String,
    },
    'attachments.$.name': {
      type: String,
    },
    'attachments.$.mimeType': {
      type: String,
    },
  }).validator(),
  run({ _id, attachments }) {
    attachments.forEach(attachment => attachment.createdAt = new Date())
    Tasks.update(_id, {
      $push: {
        attachments: {
          $each: attachments,
        },
      },
    })
    const task = Tasks.findOne(_id)
    if (task) {
      Meteor.defer(() => {
        sendSlackMessage.call({
          taskId: _id,
          parentId: task.parentId,
          type: 'ATTACH_FILE',
        })
      })
    }
  },
})
