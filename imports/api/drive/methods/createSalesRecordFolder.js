import SimpleSchema from 'simpl-schema'
import { SalesRecords, Settings } from '/imports/api/models'
import listFiles from './listFiles'
import copyFiles from './copyFiles'
import createFolder from './createFolder'
import shareWith from './shareWith'
import { ValidatedMethod } from 'meteor/mdg:validated-method'

export default new ValidatedMethod({
  name: 'drive.createSalesRecordFolder',
  validate: new SimpleSchema({
    name: { type: String },
    salesRecordId: { type: String },
  }).validator(),
  run({ name, salesRecordId }) {
    const { value: salesRecordParentFolderId } = Settings.findOne({ key: 'DEAL_ROOT_FOLDER' })
    const { value: dealTempletFolder } = Settings.findOne({ key: 'DEAL_TEMPLATE_FOLDER' })
    const { id: folderId } = createFolder.call({ name, parent: salesRecordParentFolderId })
    const { id: taskFolderId } = createFolder.call({ name: 'Tasks', parent: folderId })
    const { id: emailFolderId } = createFolder.call({ name: 'Attachments', parent: folderId })
    SalesRecords.update(salesRecordId, {
      $set: {
        folderId,
        taskFolderId,
        emailFolderId,
      },
    })

    // copy template to new created folder
    const { files } = listFiles.call({ query: `'${dealTempletFolder}' in parents` })
    files.forEach(file => {
      copyFiles.call({ fileId: file.id, parentId: folderId })
    })

    // share folder with members
    const salesRecord = SalesRecords.findOne(salesRecordId)
    if (salesRecord) {
      const memberIds = salesRecord.members.map(({ userId }) => userId)
      const emails = Meteor
        .users
        .find({ _id: { $in: memberIds } })
        .fetch()
        .filter(({ emails }) => emails && emails.length > 0)
        .map(({ emails }) => emails[0].address)
      emails.forEach(email => shareWith.call({ fileId: folderId, email }))
    }
  },
})
