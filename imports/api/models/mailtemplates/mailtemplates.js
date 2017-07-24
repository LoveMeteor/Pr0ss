import { Mongo } from 'meteor/mongo'
import SimpleSchema from 'simpl-schema'

class MailTemplatesCollection extends Mongo.Collection {
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

const MailTemplates = new MailTemplatesCollection('MailTemplates')

// Deny all client-side updates since we will be using methods to manage this collection
MailTemplates.deny({
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

MailTemplates.schema = new SimpleSchema({
    _id: {type: String, regEx: SimpleSchema.RegEx.Id},
    subject: {type: String},
    body: {type: String},
    isDefault: {type: Boolean, defaultValue:false},
    created_at: {type: Date, denyUpdate: true, optional: true},
    modified_at: {type: Date, denyInsert: true, optional: true}
})

MailTemplates.attachSchema(MailTemplates.schema)

MailTemplates.publicFields = {
    subject: 1,
    body: 1,
    isDefault: 1,
    created_at: 1,
    modified_at: 1
}

MailTemplates.helpers({

})

export default MailTemplates
