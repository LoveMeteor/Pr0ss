import _ from 'underscore'
import '../models/users/users'
import moment from 'moment-timezone'
import RegExpUtils from './RegExpUtils'
import AccountStore from './account-store'

import filesize from 'filesize'
import path from 'path'


let NylasUtils
module.exports = NylasUtils = {
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    isMe: (email) => AccountStore.accountForEmail(email)!=null,
    isFromMe: (message) => message.from[0] && NylasUtils.isMe(message.from[0].email),
    isOwner: (accountId, email) => {
        const account = AccountStore.accountForAccountId(accountId)
        if(!account || account.emailAddress!=email) return false
        return true
    },
    isValidContact: (contact) => {
        if (!contact.email) return false

        // The email regexp must match the /entire/ email address
        const result = RegExpUtils.emailRegex().exec(contact.email)
        if (result && result instanceof Array)
            return result[0] == contact.email
        else return false
    },

    contactDisplayName: (participant) => participant.name && participant.name.length ? participant.name : participant.email,

    contactDisplayFullname: (c) => {
        if (c.name && c.name.length)
            return `${c.name} <${c.email}>`

        return c.email
    },

    getParticipantsNamesString: (participants, excludeMe = true) => {
        if (excludeMe) {
            const others = participants.filter((participant) => !NylasUtils.isMe(participant.email))
            return others.map((participant) => NylasUtils.contactDisplayName(participant)).join(', ')
        } else {
            return participants.map((participant) => NylasUtils.contactDisplayName(participant)).join(', ')
        }
    },

    getParticipantsNamesArray: (participants, excludeMe = true) => {
        if (excludeMe) {
            const others = participants.filter((participant) => !NylasUtils.isMe(participant.email))
            return others.map((participant) => NylasUtils.contactDisplayName(participant))
        } else {
            return participants.map((participant) => NylasUtils.contactDisplayName(participant))
        }
    },

    shortTimeString: (time/*unixtimestamp*/) => {
        if (!time) return ''

        const diff = moment().diff(moment(time * 1000), 'days', true)

        let format
        if (diff <= 1) {
            format = 'h:mm a'
        } else if (diff > 1 && diff <= 365) {
            format = 'MMM d'
        } else {
            format = 'MMM D YYYY'
        }
        format = 'MMM D YYYY'
        return moment(time * 1000).format(format)
    },

    fullTimeString: (time/*unixtimestamp*/) => {
        if (!time) return ''

        return moment(time * 1000).tz(NylasUtils.timezone).format('dddd, MMMM Do YYYY, h:mm:ss a z')
    },

    participantsForReply: (message) => {
        let to = []
        const cc = []
        if (NylasUtils.isFromMe(message)) {
            to = message.to
        } else if (message.reply_to.length) {
            to = message.reply_to
        } else {
            to = message.from
        }

        to = _.uniq(to, (p) => p.email)

        return {to, cc}
    },

    participantsForReplyAll: (message) => {
        const excludedFroms = message.from.map((c) => c.email)
        const excludeMeAndFroms = (cc) => _.reject(cc, (p) => NylasUtils.isMe(p.email) || _.contains(excludedFroms, p.email))

        let to = null
        let cc = null

        if (NylasUtils.isFromMe(message)) {
            to = message.to
            cc = excludeMeAndFroms(message.cc)
        } else {
            if (message.reply_to.length)
                to = message.reply_to
            else
                to = message.from
            cc = excludeMeAndFroms([].concat(message.to, message.cc))
        }

        return {to, cc}
    },

    canReplyAll: (message) => {
        const {to, cc} = NylasUtils.participantsForReplyAll(message)
        return to.length > 1 || cc.length > 0
    },

    generateTempId: () => {
        const s4 = () => Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1)

        return `local-${  s4()  }${s4()  }-${  s4()}`
    },
    canArchiveThreads: () => true,
    canTrashThreads: () => true,


    isForwardedMessage: ({body, subject} = {}) => {
        let bodyForwarded = false
        let bodyFwd = false
        let subjectFwd = false

        if (body) {
            const indexForwarded = body.search(/forwarded/i)
            bodyForwarded = indexForwarded >= 0 && indexForwarded < 250
            const indexFwd = body.search(/fwd/i)
            bodyFwd = indexFwd >= 0 && indexFwd < 250
        }
        if (subject)
            subjectFwd = subject.slice(0, 3).toLowerCase() == 'fwd'

        return bodyForwarded || bodyFwd || subjectFwd
    },

    isEmptyDraft: (draft) => (!draft.subject || draft.subject.length == 0) &&
            (!draft.body || draft.body.length == 0) &&
            (!draft.files || draft.files.length == 0) &&
            (!draft.downloads || draft.downloads.length == 0) &&
            (!draft.uploads || draft.uploads.length == 0),

    usesFolders: (accountOrId) => {
        let account
        if (accountOrId instanceof Object) {
            account = accountOrId
        } else {
            account = AccountStore.accountForAccountId(accountOrId)
        }
        return account.organizationUnit == 'folder'
    },

    usesLabels: (accountOrId) => {
        let account
        if (accountOrId instanceof Object) {
            account = accountOrId
        } else {
            account = AccountStore.accountForAccountId(accountOrId)
        }
        return account.organizationUnit == 'label'
    },

    displayTypeForCategory: (category) => {
        const account = AccountStore.accountForAccountId(category.account_id)

        return account.organizationUnit
    },

    hasNylasAccounts: () => {
        const accounts = AccountStore.accounts()
        return accounts.length > 0
    },

    subjectWithPrefix: (subject, prefix) => {
        if (subject.search(/fwd:/i) == 0)
            return subject.replace(/fwd:/i, prefix)
        else if (subject.search(/re:/i) == 0)
            return subject.replace(/re:/i, prefix)
        else
            return `${prefix} ${subject}`
    },

    defaultMe: (account) => ({name: account.name || '', email: account.emailAddress}),

    replyAttributionLine: (message) => `On ${NylasUtils.formattedDateForMessage(message)}, ${message.from && message.from.length ? NylasUtils.contactDisplayFullname(message.from[0]) : ''} wrote:`,

    formattedDateForMessage: (message) => moment(message.date * 1000).format('MMM D YYYY, [at] h:mm a'),

    displayNameForFile: (file) => {
        if (!file) return null

        const defaultNames = {
            'text/calendar': 'Event.ics',
            'image/png': 'Unnamed Image.png',
            'image/jpg': 'Unnamed Image.jpg',
            'image/jpeg': 'Unnamed Image.jpg'
        }
        if (file.filename && file.filename.length)
            return file.filename
        else if (file.content_type && defaultNames[file.content_type])
            return defaultNames[file.content_type]
        else
            return 'Unnamed Attachment'
    },

    displayExtensionForFile: (file) => path.extname(NylasUtils.displayNameForFile(file).toLowerCase()).slice(1),

    displayFileSize: (file) => filesize(file.size),

    shouldDisplayAsImage: (file = {}) => {
        const name = file.filename || file.fileName || file.name || ''
        const size = file.size || file.fileSize || 0
        const ext = path.extname(name).toLowerCase()

        const extensions = ['.jpg', '.bmp', '.gif', '.png', '.jpeg']

        return _.contains(extensions, ext) && size > 512 && size < 1024 * 1024 * 5
    },

    fileIcon: (file) => {
        const name = file.filename || file.fileName || file.name || ''
        const ext = path.extname(name).toLowerCase().slice(1)
        const extensions = ['doc', 'docx', 'ics', 'pdf', 'ppt', 'pptx', 'xls', 'xlsx', 'zip']

        if(_.contains(extensions, ext))
            return `file-${ext}.png`
        else
            return 'file-fallback.png'
    }


}