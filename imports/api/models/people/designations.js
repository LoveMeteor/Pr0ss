import { Mongo } from 'meteor/mongo'
import SimpleSchema from 'simpl-schema'
import {Factory} from 'meteor/dburles:factory'
import {_} from 'meteor/underscore'
import faker from 'faker'

class DesignationsCollection extends Mongo.Collection {
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

const Designations = new DesignationsCollection('PeopleDesignations')

// Deny all client-side updates since we will be using methods to manage this collection
Designations.deny({
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
Designations.Role = new SimpleSchema({
    name: {type: String},
    is_custom: {type: Boolean, optional:true}
})
Designations.schema = new SimpleSchema({
    _id: {type: String, regEx: SimpleSchema.RegEx.Id},
    name: {type: String},
    role_addable: {type: Boolean, optional: true},
    roles: {type: Array},
    'roles.$': {type: Designations.Role},
    created_at: {type: Date, denyUpdate: true, optional: true},
    modified_at: {type: Date, denyInsert: true, optional: true}
})

Designations.attachSchema(Designations.schema)

Designations.publicFields = {
    name: 1,
    role_addable: 1,
    created_at: 1,
    modified_at: 1
}

Factory.define('designation', Designations, {
    name: faker.name.jobType(),
    role_addable: _.sample([true,false]),
    roles: []
})

Designations.helpers({
})

export default Designations
