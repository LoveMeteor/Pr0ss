import { Mongo } from 'meteor/mongo';
import SimpleSchema from 'simpl-schema';
import {Factory} from 'meteor/dburles:factory';
import {_} from 'meteor/underscore';
import faker from 'faker';
import CompanyTypes from './companytypes'
import Contacts from '../contacts/contacts'

class CompaniesCollection extends Mongo.Collection {
    insert(doc, callback) {
        const ourDoc = doc;
        ourDoc.created_at = ourDoc.created_at || new Date();
        const result = super.insert(ourDoc, callback);
        return result
    }

    remove(selector) {
        const result = super.remove(selector);
        return result;
    }
}

const Companies = new CompaniesCollection("Companies");

// Deny all client-side updates since we will be using methods to manage this collection
Companies.deny({
    insert() {
        return true;
    },
    update() {
        return true;
    },
    remove() {
        return true;
    }
});

Companies.Address = new SimpleSchema({
    address: {type: String},
    type: {type: String, optional: true},
    is_default: {type: Boolean},
    is_billing: {type: Boolean},
    is_mail: {type: Boolean}
})

Companies.PhoneNumber = new SimpleSchema({
    number: {type: String},
    type: {type: String, optional: true},
    is_default: {type: Boolean}
})

Companies.schema = new SimpleSchema({
    _id: {type: String, regEx: SimpleSchema.RegEx.Id},
    name: {type: String},
    website: {type: String, regEx: SimpleSchema.RegEx.Url, optional: true},
    type_ids: {type: Array, optional: true},
    'type_ids.$': {type: String},
    phone_numbers: {type: Array, optional: true},
    'phone_numbers.$': {type: Companies.PhoneNumber},
    addresses: {type: Array, optional: true},
    'addresses.$': {type: Companies.Address},
    user_id: {type: String, regEx: SimpleSchema.RegEx.Id, optional: true},
    created_at: {type: Date, denyUpdate: true, optional: true},
    modified_at: {type: Date, denyInsert: true, optional: true}
});

Companies.attachSchema(Companies.schema);

Companies.publicFields = {
    name: 1,
    website: 1,
    type_ids: 1,
    phone_numbers: 1,
    addresses: 1,
    user_id: 1,
    created_at: 1,
    modified_at: 1
};

Factory.define('company', Companies, {
    name: faker.company.companyName(),
    website: faker.internet.url(),
    type_ids: [Factory.get('companytype')],
    phone_numbers: [{
        number: faker.phone.phoneNumber(),
        type: faker.random.word(),
        is_default: true
    }],
    addresses: [{
        address: faker.address.streetAddress(),
        type: faker.random.word(),
        is_default: true,
        is_billing: true,
        is_mail: true
    }]
})

Companies.helpers({
    contacts: function() {
        return Contacts.find({company_id:this._id}).fetch()
    },
    types: function() {
        if(!this.type_ids || this.type_ids.length==0) return []
        return CompanyTypes.find({_id:{$in:this.type_ids}}).fetch()
    }
});

export default Companies;
