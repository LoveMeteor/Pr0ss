import { SlackMessages, Projects } from '/imports/api/models'

Meteor.publish('project.slackMessages', function (projectId) {
  check(projectId, String)
  const project = Projects.findOne(projectId)
  if (!project) return this.ready()
  return SlackMessages.find({ channel: project.slackChanel }, {sort: { createdAt: -1 }})
})
