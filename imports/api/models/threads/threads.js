import { Mongo } from 'meteor/mongo'
import SimpleSchema from 'simpl-schema'
import NylasAccounts from '../nylasaccounts/nylas-accounts'
import Messages from '../messages/messages'

class ThreadsCollection extends Mongo.Collection {
    insert(doc, callback) {
        const ourDoc = doc
        ourDoc.created_at = ourDoc.created_at || new Date()
        const result = super.insert(ourDoc, callback)
        return result
    }

    remove(selector) {
        const result = super.remove(selector)
        return result
    }
}

const Threads = new ThreadsCollection('Threads')

// Deny all client-side updates since we will be using methods to manage this collection
Threads.deny({
    insert() {
        return true
    },
    update() {
        return true
    },
    remove() {
        return true
    }
})

Threads.schema = new SimpleSchema({
    _id: {type: String, regEx: SimpleSchema.RegEx.Id},

    id: {type: String, optional: true},
    account_id: {type: String},
    subject: {type: String, optional: true},
    participants: {type: Array, optional: true},
    'participants.$': {
        type: Object
    },
    'participants.$.name': {
        type: String,
        optional: true
    },
    'participants.$.email': {
        type: String,
        regEx: SimpleSchema.RegEx.Email
    },
    last_message_timestamp: {type: Number},
    last_message_received_timestamp: {type: Number},
    first_message_timestamp: {type: Number},
    unread: {type: Boolean, optional: true},
    starred: {type: Boolean, optional: true},
    snippet: {type: String, optional: true},
    message_ids: {type: Array, optional: true},
    'message_ids.$': {
        type: String
    },
    version: {type: Number},
    folders: {type: Array, optional: true},
    'folders.$': {
        type: Object
    },
    'folders.$.id': {
        type: String,
        optional:true
    },
    'folders.$.display_name': {
        type: String,
        optional:true
    },
    'folders.$.name': {
        type: String,
        optional:true
    },
    labels: {type: Array, optional: true},
    'labels.$': {
        type: Object
    },
    'labels.$.id': {
        type: String,
        optional:true
    },
    'labels.$.display_name': {
        type: String,
        optional:true
    },
    'labels.$.name': {
        type: String,
        optional:true
    },

    salesRecordId: {type: String, optional: true},
    conversationId: {type: String, optional: true},
    created_at: {type: Date, denyUpdate: true, optional: true},
    modified_at: {type: Date, denyInsert: true, optional: true}
})

Threads.attachSchema(Threads.schema)

Threads.publicFields = {
    id: 1,
    account_id: 1,
    subject: 1,
    participants: 1,
    last_message_timestamp: 1,
    last_message_received_timestamp: 1,
    first_message_timestamp: 1,
    unread: 1,
    starred: 1,
    snippet: 1,
    message_ids: 1,
    version: 1,
    folders: 1,
    labels: 1,

    salesRecordId: 1,
    conversationId: 1,

    created_at: 1,
    modified_at: 1
}

Threads.helpers({
    account() {
        return NylasAccounts.findOne({accountId: this.account_id})
    },
    messages() {
        const messages =  Messages.find({thread_id: this.id}).fetch()
        return messages
    }
})

export default Threads
