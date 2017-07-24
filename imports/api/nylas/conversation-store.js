import _ from 'underscore'
import Reflux from 'reflux'
import Actions from './actions'
import NylasUtils from './nylas-utils'
import {SalesRecords, Conversations} from '../models'

export default class ConversationStore extends Reflux.Store {
    constructor({salesRecordId, conversationId}) {
        super()


        this.listenTo(Actions.toggleMessageExpanded, this._onToggleMessageExpanded)
        this.listenTo(Actions.toggleAllMessagesExpanded, this._onToggleAllMessagesExpanded)
        this.listenTo(Actions.toggleHiddenMessages, this._onToggleHiddenMessages)

        this.salesRecordId = salesRecordId
        this.conversationId = conversationId
        this._messages = this.getMessages()
        this._messages.sort((m1, m2) => m1.date - m2.date)
        this._messagesExpanded = {}

        this._expandMessagesToDefault()
        this._fetchExpandedAttachments(this._messages)
    }
    getMessages() {
        if(this.salesRecordId) {
            return SalesRecords.findOne(this.salesRecordId).messages()
        } else if(this.conversationId) {
            return Conversations.findOne(this.conversationId).messages()
        } else {
            return []
        }
    }
    _onToggleMessageExpanded(id) {
        const message = _.findWhere(this._messages, {id})

        if (!message) return

        if (this._messagesExpanded[id])
            this._collapseMessage(message)
        else
            this._expandMessage(message)
        this.trigger()
    }

    _onToggleAllMessagesExpanded() {
        if (this.hasCollapsedMessages())
            this._messages.forEach((message) => this._expandMessage(message))
        else
            [...-1].this._messages.forEach((message) => this._collapseMessage(message))
        this.trigger()
    }

    _onToggleHiddenMessages() {
        this._showingHiddenMessages = !this._showingHiddenMessages
        this._expandMessagesToDefault()
        this._fetchExpandedAttachments(this._messages)
        this.trigger()
    }
    _expandMessagesToDefault() {
        const visibleMessages = this._messages

        visibleMessages.forEach((message, idx) => {
            if(message.unread || message.draft || idx==visibleMessages.length - 1)
                this._messagesExpanded[message.id] = 'default'
        })

    }
    _expandMessage(message) {
        this._messagesExpanded[message.id] = 'explicit'
        this._fetchExpandedAttachments([message])
    }

    _collapseMessage(message) {
        delete this._messagesExpanded[message.id]
    }

    hasCollapsedMessages() {
        return _.size(this._messagesExpanded) < this._messages.length
    }
    _fetchExpandedAttachments(messages) {

        for (const message of messages) {
            if (!this._messagesExpanded[message.id]) continue
            for (const file of message.files) {
                if(NylasUtils.shouldDisplayAsImage(file)) {
                    Actions.fetchImage(_.extend(_.clone(file), {account_id: message.account_id}))
                }
            }
        }
    }

    messages(cb) {
        const messages = this.getMessages()
        if(messages.length != this._messages.length) {
            this._messages = messages

            this._messages.sort((m1, m2) => m1.date - m2.date)

            this._expandMessagesToDefault()
            this._fetchExpandedAttachments(this._messages)
            if(cb) cb()
        } else {
          this._messages = messages
        }

        return this._messages
    }

    messagesExpanded() {
        return _.clone(this._messagesExpanded)
    }

    addMessage(message) {
        this._messages.push(message)
        this.trigger()
    }

}
