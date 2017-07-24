import config from '/imports/api/config'
import SlackBot from 'slackbots'

const {
  slack: {
    botToken: SLACK_BOT_TOKEN,
    botName: SLACK_BOT_NAME
  }
} = config

export default new SlackBot({
  token: SLACK_BOT_TOKEN,
  name: SLACK_BOT_NAME
})
