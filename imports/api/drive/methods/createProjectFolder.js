import SimpleSchema from 'simpl-schema'
import createFolder from './createFolder'
import listFiles from './listFiles'
import copyFiles from './copyFiles'
import shareWith from './shareWith'
import { Projects, Settings } from '../../models'
import { ValidatedMethod } from 'meteor/mdg:validated-method'

export default new ValidatedMethod({
  name: 'drive.createProjectFolder',
  validate: new SimpleSchema({
    name: { type: String },
    projectId: { type: String },
  }).validator(),
  run({ name, projectId }) {
    const { value: projectParentFolderId } = Settings.findOne({ key: 'PROJECT_ROOT_FOLDER' })
    const { value: projectTemplateFolder } = Settings.findOne({ key: 'PROJECT_TEMPLATE_FOLDER' })
    const { id: folderId } =  createFolder.call({ name , parent: projectParentFolderId })
    const { id: taskFolderId } = createFolder.call({ name:  'Tasks', parent: folderId })
    Projects.update(projectId, {
      $set: {
        folderId,
        taskFolderId,
      },
    })

    // copy template to new created folder
    const { files } = listFiles.call({ query: `'${projectTemplateFolder}' in parents` })
    files.forEach(file => {
      copyFiles.call({ fileId: file.id, parentId: folderId })
    })

    // share folder with members
    const project = Projects.findOne(projectId)
    if (project) {
      const memberIds = project.members.map(({ userId }) => userId)
      const emails = Meteor
        .users
        .find({ _id: { $in:  memberIds } })
        .fetch()
        .filter(({ emails }) => emails && emails.length > 0)
        .map(({ emails }) => emails[0].address)
      emails.forEach(email => shareWith.call({ fileId: folderId, email }))
    }
  },
})
