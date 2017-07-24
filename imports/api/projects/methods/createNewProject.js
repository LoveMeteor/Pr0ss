import {Roles} from 'meteor/alanning:roles'
import { Projects, ROLES } from '/imports/api/models'
import { prossDocDrive } from '/imports/api/drive'
import SimpleSchema from 'simpl-schema'
import { ValidatedMethod } from 'meteor/mdg:validated-method'
import { slackClient } from '/imports/api/slack'

return new ValidatedMethod({
  name: 'createNewProject',
  validate: new SimpleSchema({
    name: String,
    members: Array,
    'members.$': Object,
    'members.$.userId': String,
    'members.$.isAdmin': Boolean,
  }).validator(),
  run({ name, members }) {
    const project = { name, members }
    // CHECK ROLE
    if (!Roles.userIsInRole(this.userId, [ROLES.ADMIN, ROLES.SALES]))
      throw new Meteor.Error('Access denied')

    // INSERT
    const projectId = Projects.insert(project)

    // CREATE NEW CHANNEL
    let { data } = slackClient.channels.create({ name: project.name })
    // RETRY WITH UNIQUE NAME
    if (!data.ok) {
      data = slackClient.channels.create({ name: `${project.name}-${Random.id()}` })
    }
    if (data.ok) {
      const slackChanel = data.channel.id
      // INVITE MEMBERS to CHANNEL
      Meteor.users.find({
        _id: { $in: project.members.map(({ userId }) => userId) },
        slack: { $exists: true },
      }).forEach(
        ({ slack: { id } }) => slackClient.channels.invite({ channel: slackChanel, user: id })
      )
      // UPDATE slackChanel
      Projects.update(projectId, {
        $set: { slackChanel },
      })

      // INVITE SLACKBOT to CHANNEL
      slackClient.channels.inviteBot({ channel: slackChanel })

      // SET SLACK PURPOSE
      slackClient.channels.setPurpose({
        channel: slackChanel,
        purpose: Meteor.absoluteUrl(`project/${projectId}`),
      })

      Meteor.defer(() => {
        // CREATE DRIVE
        prossDocDrive.createProjectFolder.call({ name: project.name, projectId })
      })
    }

    return projectId
  }
})
