import { ValidatedMethod } from 'meteor/mdg:validated-method'
import SimpleSchema from 'simpl-schema'
import { Tasks } from '../../models'
import { prossDocDrive } from '/imports/api/drive'
import sendSlackMessage from './sendSlackMessage'

export default new ValidatedMethod({
  name: 'task.removeAttachment',
  validate: new SimpleSchema({
    _id: String,
    fileId: String,
  }).validator(),
  run({ _id, fileId }) {
    Tasks.update(_id, {
      $pull: {
        attachments: {
          _id: fileId,
        },
      },
    })
    Meteor.defer(() => {
      prossDocDrive.removeFiles.call({ fileId })
      const task = Tasks.findOne(_id)
      if (task) {
        sendSlackMessage.call({
          taskId: _id,
          parentId: task.parentId,
          type: 'REMOVE_FILE',
        })
      }
    })
  },
})
