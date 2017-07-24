import { drive } from './drive'
import SimpleSchema from 'simpl-schema'
import { ValidatedMethod } from 'meteor/mdg:validated-method'

export default new ValidatedMethod({
  name: 'drive.copy',
  validate: new SimpleSchema({
    fileId: {
      type: String,
    },
    parentId: {
      type: String,
    }
  }).validator(),
  run({ fileId, parentId }) {
    const getFile = Meteor.wrapAsync(drive.files.get)
    const createFile = Meteor.wrapAsync(drive.files.create)
    const copyFile = Meteor.wrapAsync(drive.files.copy)
    const listFiles = Meteor.wrapAsync(drive.files.list)
    const copy = (fileId, parentId) => {
      const { mimeType, name } = getFile({ fileId })
      if(mimeType === 'application/vnd.google-apps.folder') {
        const folder = createFile({
          resource: {
            name,
            mimeType,
            parents: [parentId]
          }
        })
        const { files } = listFiles({ q: `'${fileId}' in parents` })
        files.forEach(file => copy(file.id, folder.id))
      } else {
        copyFile({ fileId, resource: { parents: [parentId], name } })
      }
    }
    copy(fileId, parentId)
  }
})

