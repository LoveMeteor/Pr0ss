import { Mongo } from 'meteor/mongo'
import SimpleSchema from 'simpl-schema'
import {Factory} from 'meteor/dburles:factory'
import {_} from 'meteor/underscore'
import faker from 'faker'

class CompanyTypesCollection extends Mongo.Collection {
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

const CompanyTypes = new CompanyTypesCollection("CompanyTypes");

// Deny all client-side updates since we will be using methods to manage this collection
CompanyTypes.deny({
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

CompanyTypes.schema = new SimpleSchema({
    _id: {type: String, regEx: SimpleSchema.RegEx.Id},
    name: {type: String},
    user_id: {type: String, regEx: SimpleSchema.RegEx.Id, optional: true},
    created_at: {type: Date, denyUpdate: true, optional: true},
    modified_at: {type: Date, denyInsert: true, optional: true}
});

CompanyTypes.attachSchema(CompanyTypes.schema);

CompanyTypes.publicFields = {
    name: 1,
    user_id: 1,
    created_at: 1,
    modified_at: 1
};

Factory.define('companytype', CompanyTypes, {
    name: faker.name.jobType()
})

CompanyTypes.helpers({
});

export default CompanyTypes;
