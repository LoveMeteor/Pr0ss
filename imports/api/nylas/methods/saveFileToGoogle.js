import { ValidatedMethod } from 'meteor/mdg:validated-method'
import SimpleSchema from 'simpl-schema'
import request from 'request'
import { drive } from '/imports/api/drive/methods/drive'
import { Messages, NylasAccounts, SalesRecords, Threads } from '/imports/api/models'

export default new ValidatedMethod({
  name: 'Nylas.saveFileToGoogle',
  validate: new SimpleSchema({
    fileId: String,
  }).validator(),
  run({ fileId }) {
    if (!this.userId) return
    const message = Messages.findOne({ files: { $elemMatch: { id: fileId, isBackedUp: { $exists: false } } } })
    if (!message) return
    const { id, filename, content_type } = message.files.find(({ id }) => id === fileId)
    const { salesRecordId } = Threads.findOne({ id: message.thread_id })
    const { emailFolderId } = SalesRecords.findOne(salesRecordId)
    if (!emailFolderId) return
    const { accessToken } = NylasAccounts.findOne({ accountId: message.account_id })
    Meteor.defer(() => {
      const queryURL= `https://api.nylas.com/files/${id}/download`
      Meteor.wrapAsync(callback => {
        const stream = request.get(queryURL, {
          auth: {
            user: accessToken,
            password: '',
            sendImmediately: '',
          }
        })
        drive.files.create({
          resource: {
            name: filename,
            mimeType: content_type,
            parents: [emailFolderId],
          },
          media: {
            mimeType: content_type,
            body: stream,
          }
        }, callback)
      })()
    })
    return Messages.update({ files: { $elemMatch: { id: fileId } } }, { $set: { 'files.$.isBackedUp': true }})
  }
})
