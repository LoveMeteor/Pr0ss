import { Mongo } from 'meteor/mongo';
import SimpleSchema from 'simpl-schema';
import NylasAccounts from '../nylasAccounts/nylas-accounts';

class TodosCollection extends Mongo.Collection {
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

const Todos = new TodosCollection("Todos");

// Deny all client-side updates since we will be using methods to manage this collection
Todos.deny({
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

Todos.schema = new SimpleSchema({
    _id: {type: String, regEx: SimpleSchema.RegEx.Id},
    id: {type: String},
    account_id: {type: String},
    email: {type: String},
    title: {type: String, optional: true},
    content: {type: String, optional: true},
    //description: {type: String, optional: true},
    created_at: {type: Date, denyUpdate: true, optional: true},
    modified_at: {type: Date, denyInsert: true, optional: true}
});

Todos.attachSchema(Todos.schema);

Todos.publicFields = {
    id: 1,
    account_id: 1,
    email: 1,
    title: 1,
    content: 1,
    //description: 1,
    created_at: 1,
    modified_at: 1
};

Todos.helpers({
    account() {

        return NylasAccounts.findOne({accountId: this.account_id})
    }
});

export default Todos;
