import slackBot from './slackBot'

slackBot.on('message', Meteor.bindEnvironment(data => {
  data.type === 'message' && Meteor.call('parseSlackMessage', data)
}))
