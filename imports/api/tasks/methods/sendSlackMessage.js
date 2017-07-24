import { ValidatedMethod } from 'meteor/mdg:validated-method'
import SimpleSchema from 'simpl-schema'
import { SalesRecords, Projects, Tasks } from '/imports/api/models'
import { slackClient } from '/imports/api/slack'

const RED = '#FF4C4C'
const ORANGE = '#FFA64C'
const BLUE = '#7CD197'

export default new ValidatedMethod({
  name: 'task.sendSlackMessage',
  validate: new SimpleSchema({
    parentId: String,
    taskId: String,
    type: String,
  }).validator(),
  run({ parentId, type, taskId }) {
    let parent = null
    let parentType = null

    if (parent = SalesRecords.findOne(parentId)) {
      parentType = 'salesrecord'
    } else {
      if (parent = Projects.findOne(parentId)) {
        parentType = 'project'
      }
    };

    if (parent) {
      const { slackChanel: channel } = parent
      const { name, description: text, status, comments, assignee } = Tasks.findOne(taskId)
      const title_link = Meteor.absoluteUrl(`${parentType}/${parentId}`)
      const title = `Task: ${name}`
      if (channel) {
        switch (type) {
          case 'ADD_COMMENT': {
            const comment = _.last(comments)
            const user = Meteor.users.findOne(comment.userId)
            let pretext = `A new comment from @${user.username} has been added`
            if (user.slack && user.slack.id)
              pretext = `A new comment from <@${user.slack.id}> has been added`
            const attachments = slackClient.attachments.create({
              pretext,
              title,
              text: comment.content,
              color: BLUE,
            })
            slackClient.chat.postAttachments({ channel, attachments })
            break
          }

          case 'REMOVE_FILE': {
            const attachments = slackClient.attachments.create({
              pretext: 'A attachment file has been removed',
              title,
              text,
              color: RED,
              title_link,
            })
            slackClient.chat.postAttachments({ channel, attachments })
            break
          }

          case 'ATTACH_FILE': {
            const attachments = slackClient.attachments.create({
              pretext: 'A file have been attached',
              title,
              text,
              color: BLUE,
              title_link,
            })
            slackClient.chat.postAttachments({ channel, attachments })
            break
          }

          case 'UPDATE_TASK': {
            const attachments = slackClient.attachments.create({
              pretext: `A task have been updated at ${status} board`,
              title,
              text,
              color: ORANGE,
              title_link,
            })
            slackClient.chat.postAttachments({ channel, attachments })
            break
          }

          case 'REMOVE_TASK': {
            const attachments = slackClient.attachments.create({
              pretext: `A task have been removed from ${status} board`,
              title,
              text,
              color: RED,
              title_link,
            })
            slackClient.chat.postAttachments({ channel, attachments })
            break
          }

          case 'NEW_TASK': {
            const user = Meteor.users.findOne(assignee)
            let pretext = `New task has assigned to @${user.username} in ${status} board`
            if (user.slack && user.slack.id)
              pretext = `New task has assigned to <@${user.slack.id}> in ${status} board`
            const attachments = slackClient.attachments.create({
              pretext,
              title,
              text,
              color: BLUE,
              title_link,
            })
            slackClient.chat.postAttachments({ channel, attachments })
            break
          }
        }
      }
    }
  },
})
