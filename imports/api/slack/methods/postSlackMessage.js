import { Meteor } from 'meteor/meteor'
import SimpleSchema from 'simpl-schema'
import slackClient from '../restful'

Meteor.methods({
  postSlackMessage(channel, text) {
    new SimpleSchema({
      channel: String,
      text: String,
    }).validate({ channel, text })
    return slackClient.chat.postMessage({ channel, text })
  }
})
