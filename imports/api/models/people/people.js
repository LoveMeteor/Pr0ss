import { Mongo } from 'meteor/mongo'
import SimpleSchema from 'simpl-schema'
import {Factory} from 'meteor/dburles:factory'
import {_} from 'meteor/underscore'
import faker from 'faker'
import PeopleDesignations from './designations'
import Companies from '../companies/companies'

class PeopleCollection extends Mongo.Collection {
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

const People = new PeopleCollection('People')

// Deny all client-side updates since we will be using methods to manage this collection
People.deny({
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

People.EmailTypes = ['main', 'office', 'personal']
People.PhoneNumberTypes = ['office', 'mobile', 'home']


People.Email = new SimpleSchema({
    email: {type: String, regEx: SimpleSchema.RegEx.Email},
    type: {type: String, optional: true},
    is_default: {type: Boolean, optional:true}
})

People.PhoneNumber = new SimpleSchema({
    number: {type: String},
    extension: {type: Number, optional:true},
    type: {type: String, optional:true},
    is_default: {type: Boolean, optional:true}
})

People.schema = new SimpleSchema({
    _id: {type: String, regEx: SimpleSchema.RegEx.Id},
    name: {type: String},
    twitter: {type: String, regEx: SimpleSchema.RegEx.Url, optional: true},
    facebook: {type: String, regEx: SimpleSchema.RegEx.Url, optional: true},
    linkedin: {type: String, regEx: SimpleSchema.RegEx.Url, optional: true},
    designation_id: {type: String, regEx: SimpleSchema.RegEx.Id},
    role: {type: String},
    is_user: {type: Boolean, optional: true},
    emails: {type: Array, optional: true, defaultValue:[]},
    'emails.$': {type: People.Email},
    phone_numbers: {type: Array, optional: true, defaultValue:[]},
    'phone_numbers.$': {type: People.PhoneNumber},
    company_id: {type: String, regEx: SimpleSchema.RegEx.Id, optional: true},
    position: {type: String, optional: true},
    user_id: {type: String, regEx: SimpleSchema.RegEx.Id, optional: true},
    created_at: {type: Date, denyUpdate: true, optional: true},
    modified_at: {type: Date, denyInsert: true, optional: true}
})

People.attachSchema(People.schema)

People.publicFields = {
    name: 1,
    twitter: 1,
    facebook: 1,
    linkedin: 1,
    designation_id: 1,
    role: 1,
    is_user: 1,
    emails: 1,
    phone_numbers: 1,
    company_id: 1,
    position: 1,
    user_id: 1,
    created_at: 1,
    modified_at: 1
}

Factory.define('person', People, {
    name: faker.name.findName(),
    twitter: faker.internet.url(),
    facebook: faker.internet.url(),
    linkedin: faker.internet.url(),
    designation_id: Factory.get('designation'),
    role: 'Manager',
    company_id: Factory.get('company'),
    emails: [{
        email: faker.internet.email(),
        type: _.sample(People.EmailTypes),
        is_default: true
    }],
    phone_numbers: [{
        number: faker.phone.phoneNumber(),
        extension: Number(0),
        type: _.sample(People.PhoneNumberTypes),
        is_default: true
    }]
})

People.helpers({
    designation() {
        if(!this.designation_id) return null
        return PeopleDesignations.findOne(this.designation_id)
    },
    company() {
        if(!this.company_id) return null
        return Companies.findOne(this.company_id)
    },
    defaultEmail() {
        if(!this.emails || this.emails.length==0) return null

        let email = this.emails[0].email
        this.emails.forEach((em) => {
          if(em.is_default) email = em.email
        })

        return email
    }
})

export default People
