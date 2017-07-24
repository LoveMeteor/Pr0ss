import { Mongo } from 'meteor/mongo'
import SimpleSchema from 'simpl-schema'

class SlackMailsCollection extends Mongo.Collection {
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

const SlackMails = new SlackMailsCollection('SlackMails')

// Deny all client-side updates since we will be using methods to manage this collection
SlackMails.deny({
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

SlackMails.schema = new SimpleSchema({
    _id: {type: String, regEx: SimpleSchema.RegEx.Id},

    thread_id: {type: String},
    thread_ts: {type: String},
    created_at: {type: Date, denyUpdate: true, optional: true},
    modified_at: {type: Date, denyInsert: true, optional: true}
})

SlackMails.attachSchema(SlackMails.schema)

SlackMails.publicFields = {
    thread_id: 1,
    thread_ts: 1,

    created_at: 1,
    modified_at: 1
}

SlackMails.helpers({
    /*account() {
        const {NylasAccounts} = require('../nylasaccounts/nylas-accounts')

        return NylasAccounts.findOne({accountId: this.account_id})
    }*/
})

export default SlackMails
