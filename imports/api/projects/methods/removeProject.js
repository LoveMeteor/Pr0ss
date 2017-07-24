import { HTTP } from 'meteor/http'
import {Roles} from 'meteor/alanning:roles'
import SimpleSchema from 'simpl-schema'
import { ROLES, Projects } from '/imports/api/models'
import { prossDocDrive } from '/imports/api/drive'
import { slackClient } from '/imports/api/slack'

Meteor.methods({
  removeProject({ _id, isRemoveFolders, isRemoveSlack }) {
    new SimpleSchema({
      _id: String,
      isRemoveFolders: Boolean,
      isRemoveSlack: Boolean,
    }).validate({ _id, isRemoveFolders, isRemoveSlack })

    if (Roles.userIsInRole(this.userId, ROLES.ADMIN)) {
      const project = Projects.findOne(_id)
      if (project) {
        const { _id, folderId, slackChanel } = project

        // Remove Project
        Projects.remove(_id)

        // Run later
        Meteor.defer(() => {
          // Remove slack channel
          isRemoveSlack && slackClient.channels.archive({ channel: slackChanel })
          // Remove folder
          isRemoveFolders && prossDocDrive.removeFiles.call({ fileId: folderId })
        })
      }
    }
  },
})
