import {HTTP} from 'meteor/http'
import config from '/imports/api/config'

export const ERROR = {
    AlreadyInTeam: 'already_in_team',
    AlreadyInvited: 'already_invited'
}
const {
    slack: {
        apiRoot: SLACK_API_ROOT,
        apiKey: SLACK_API_TOKEN,
        inviteKey: SLACK_INVITE_KEY,
        botId: SLACK_BOT_ID,
        botToken: SLACK_BOT_TOKEN,
        botName: SLACK_BOT_NAME
    }
} = config

const slackClient = {
    makeRequest: (path, options = {}) => HTTP.get(`${SLACK_API_ROOT}/${path}`, {
        params: {
            token: options.token ? options.token : SLACK_API_TOKEN,
            ...options,
        }
    }),
    makeRawRequest: ({url}) => HTTP.get(url, {
        params: {
            token: SLACK_API_TOKEN,
        }
    }),
    makeBotRequest: (path, options = {}) => HTTP.get(`${SLACK_API_ROOT}/${path}`, {
        params: {
            token: SLACK_BOT_TOKEN,
            ...options,
        }
    }),
}

const users = {
    list: (cursor) => slackClient.makeRequest('users.list',cursor?{cursor}:{}),
    admin: {
        invite: ({email}) => slackClient.makeRequest('users.admin.invite', {email, token:SLACK_INVITE_KEY})
    }
}

const channels = {
  archive: ({ channel }) => slackClient.makeRequest('channels.archive', { channel }),
  create: ({ name }) => slackClient.makeRequest('channels.create', { name }),
  invite: ({ channel, user }) => slackClient.makeRequest('channels.invite', { channel, user }),
  inviteBot: ({ channel }) => slackClient.makeRequest('channels.invite', { channel, user: SLACK_BOT_ID }),
  list: () => slackClient.makeRequest('channels.list'),
  rename: ({ channel, name }) => slackClient.makeRequest('channels.rename', { channel, name }),
  setPurpose: ({ channel, purpose }) => slackClient.makeRequest('channels.setPurpose', { channel, purpose }),
}

const chat = {
    postMessage: ({channel, text}) => slackClient.makeBotRequest('chat.postMessage', {channel, text}),
    postAttachments: ({channel, attachments}) => slackClient.makeBotRequest('chat.postMessage', {
        channel,
        username: SLACK_BOT_NAME,
        as_user: false,
        attachments
    }),
    postRawMessage: ({channel, text, attachments, icon_url, as_user, username}) => slackClient.makeBotRequest('chat.postMessage', {
        channel,
        as_user,
        username,
        attachments,
        icon_url,
        text
    }),
}

const files = {
    sharedPublicURL: ({file}) => slackClient.makeRequest('files.sharedPublicURL', {file}),
    get: ({url}) => slackClient.makeRawRequest({url}),
}

const attachments = {
    create: ({pretext, title, text, color, title_link}) => JSON.stringify([{pretext, title, text, color, title_link}]),
}

export {
    users,
    channels,
    chat,
    files,
    attachments,
}
