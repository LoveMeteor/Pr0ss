import _ from 'underscore'
import request from 'request'
import { Meteor } from 'meteor/meteor'
import NylasAccounts from '/imports/api/models/nylasaccounts/nylas-accounts'
import { drive } from '/imports/api/drive/methods/drive'
import Threads from '/imports/api/models/threads/threads'
import Messages from '/imports/api/models/messages/messages'
import SalesRecords from '/imports/api/models/salesRecords/salesRecords'

const saveAttachmentToDrive = (accessToken, parents, { filename, content_type, id }) => {
  console.log('---> save attachment ', filename)
  const queryURL= `https://api.nylas.com/files/${id}/download`
  return Meteor.wrapAsync(callback => {
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
        parents,
      },
      media: {
        mimeType: content_type,
        body: stream,
      }
    }, callback)
  })()
}

export default function() {
  const salesRecords = SalesRecords.find({
    emailFolderId: { $exists: true } },
    { fields: { _id: 1, emailFolderId: 1 }
    }).fetch()

  salesRecords.forEach(({ _id, emailFolderId }) => {
    const threads = Threads.find(
      { salesRecordId: _id },
      { fields: { _id: 1, id: 1 } }
    ).fetch()
    const messages = Messages.find(
      { isAttachmentBackup: {$ne: true}, thread_id: { $in: _.pluck(threads, 'id') } },
      { fields: { _id: 1, files: 1, account_id: 1 } }
    ).fetch()
    const files = messages
      .map(({ files, account_id }) => {
        const account = NylasAccounts.findOne({ accountId: account_id })
        if (account && files && files.length) {
          files.forEach(file => file.accessToken = account.accessToken)
        }
        return files
      })
      .reduce((result, next) => result.concat(next), [])
    const uniqueFiles = _.uniq(files, ({ id }) => id)
    Meteor.defer(() => {
      uniqueFiles.forEach(file => file.accessToken && saveAttachmentToDrive(file.accessToken, [emailFolderId], file))
    })
    Messages.update(
      { _id: { $in: _.pluck(messages, '_id') } },
      { $set: { isAttachmentBackup: true }},
      { multi: true }
    )
  })
}
