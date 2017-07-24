import { Meteor } from 'meteor/meteor'
import slackClient from '../restful'
import { SlackMails } from '/imports/api/models'
import { slack } from '/imports/api/config'

Meteor.methods({
  sendBotMessage(channel, text, { username = slack.botName, icon_url, attachments, as_user = false }, thread_id) {
    check(channel, String)
    check(text, String)
    check(username, String)
    check(icon_url, Match.Optional(String))
    check(attachments, Match.Optional(Array))
    check(as_user, Boolean)
    check(thread_id, Match.Maybe(String))

    const { data: { ts } } = slackClient.chat.postRawMessage({
      channel,
      text,
      username,
      icon_url,
      as_user,
      attachments: JSON.stringify(attachments),
    })
    if (thread_id) {
      const existingSlackMail = SlackMails.findOne({ thread_id })
      !existingSlackMail && SlackMails.insert({ thread_id, thread_ts: ts })
    }
  }
})
