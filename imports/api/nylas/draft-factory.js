import AccountStore from './account-store'
import NylasUtils from './nylas-utils'
import DOMUtils from '/imports/ui/utils/dom-utils'


class DraftFactory {
    createDraft = (fields = {}) => {
        const account = fields.account_id ? AccountStore.accountForAccountId(fields.account_id) : AccountStore.getSelectedAccount()
        if (!account) return Promise.reject(new Error('Could not get Nylas account info'))

        const body = fields.body || ''
        return Promise.resolve(_.extend({
            body,
            subject: '',
            clientId: NylasUtils.generateTempId(),
            from: [NylasUtils.defaultMe(account)],
            to: [],
            cc: [],
            bcc: [],
            date: new Date().getTime() / 1000,
            account_id: account.accountId,
            draft: true
        }, fields))
    }

    createDraftForReply = ({message, type}) => {
        const account = AccountStore.accountForAccountId(message.account_id)
        if (!account) return Promise.reject(new Error('Could not get Nylas account info'))

        const {to, cc} = type == 'reply-all' ? NylasUtils.participantsForReplyAll(message) : NylasUtils.participantsForReply(message)

        const body = ''

        return this.createDraft({
            subject: NylasUtils.subjectWithPrefix(message.subject, 'Re:'),
            to,
            cc,
            thread_id: message.thread_id,
            reply_to_message_id: message.id,
            account_id: message.account_id,
            body: `${body}<br><br><div class="gmail_quote">
            ${DOMUtils.escapeHTMLCharacters(NylasUtils.replyAttributionLine(message))}
            <br>
            <blockquote class="gmail_quote"
              style="margin:0 0 0 .8ex;border-left:1px #ccc solid;padding-left:1ex;">
              ${message.body}
            </blockquote>
          </div>`
        })
    }

    createDraftForForward = ({message}) => {
        const account = AccountStore.accountForAccountId(message.account_id)
        if (!account) return Promise.reject(new Error('Could not get Nylas account info'))

        const body = ''

        const contactsAsHtml = (cs) => DOMUtils.escapeHTMLCharacters(cs.map((c) => NylasUtils.contactDisplayFullname(c)).join(', '))
        const fields = []
        if (message.from.length > 0) fields.push(`From: ${contactsAsHtml(message.from)}`)
        fields.push(`Subject: ${message.subject}`)
        fields.push(`Date: ${NylasUtils.formattedDateForMessage(message)}`)
        if (message.to.length > 0) fields.push(`To: ${contactsAsHtml(message.to)}`)
        if (message.cc.length > 0) fields.push(`Cc: ${contactsAsHtml(message.cc)}`)

        return this.createDraft({
            subject: NylasUtils.subjectWithPrefix(message.subject, 'Fwd:'),
            files: [].concat(message.files),
            thread_id: message.thread_id,
            account_id: message.account_id,
            body: `${body}<br><br><div class="gmail_quote">
            ---------- Forwarded message ---------
            <br><br>
            ${fields.join('<br>')}
            <br><br>
            ${message.body}
          </div>`
        })
    }

    getBodyWithSignature = (body, accountId) => {
        if(!accountId) return body
        const account = AccountStore.accountForAccountId(accountId)
        if (!account) return body

        if(account.signature && account.signature.length) {
            body += `<br><br><div class="gmail_quote">${account.signature}</div>`
        }

        return body
    }
}

module.exports = new DraftFactory()