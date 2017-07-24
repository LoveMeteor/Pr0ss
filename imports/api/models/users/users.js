import {Roles} from 'meteor/alanning:roles'
import { Factory } from 'meteor/dburles:factory'
import SimpleSchema from 'simpl-schema'
import faker from 'faker'
import { Accounts } from 'meteor/accounts-base'
import NylasAccounts from '../nylasaccounts/nylas-accounts'


export const ROLES = {
    ADMIN: 'admin',
    MANAGER: 'manager',
    SALES: 'sales',
    TAKEOFFS: 'takeoffs',
    ARCH: 'arch'
}

export const STATUS = {
    PENDING: 'pending',
    ACTIVE: 'active'
}

const Schema = {}

Schema.User = new SimpleSchema({
    username: {
        type: String,
        optional: true
    },
    emails: {
        type: Array,
        optional: true
    },
    'emails.$': {
        type: Object
    },
    'emails.$.address': {
        type: String,
        regEx: SimpleSchema.RegEx.Email
    },
    'emails.$.verified': {
        type: Boolean
    },
    createdAt: {
        type: Date
    },
    // Make sure this services field is in your schema if you're using any of the accounts packages
    services: {
        type: Object,
        optional: true,
        blackbox: true
    },
    roles: {
        type: Array,
        optional: true
    },
    'roles.$': {
        type: String
    },
    profile: {
        type: Object,
        optional: true
    },
    'profile.firstName': {
        type: String
    },
    'profile.lastName': {
        type: String
    },
    'profile.signature': {
        type: String,
        optional: true
    },
    'profile.conversationGroups': {
        type: Object,
        optional: true
    },
    status: {
      type: String,
      optional: true,
      allowedValues: ['active', 'pending', 'banned']
    },
    slackInvited: {
        type: Boolean,
        optional: true
    },
    slack: {
        type: Object,
        optional: true,
        blackbox: true
    },
    createdBy: {
        type: String,
        optional: true,
    }
})

export const UserSchema = Schema.User

Meteor.users.attachSchema(UserSchema)
Meteor.users.publicFields = {
    username: 1,
    emails: 1,
    firstName: 1,
    lastName: 1,
    roles: 1,
    slack: 1,
    createdAt: 1,
    status: 1
}

// Deny all client-side updates to user documents
Meteor.users.deny({
    insert() { return true },
    update() { return true },
    remove() { return true },
})

Factory.define('user', Meteor.users, {
    username: () => faker.lorem.word() + Random.id(10),
    firstName: () => faker.lorem.word(),
    lastName: () => faker.lorem.word()
})

Meteor.users.helpers({
    email() {
        if(this.emails.length > 0)
        {
            return this.emails[0].address
        }
        return null
    },

    nylasAccounts() {
        return NylasAccounts.find({
            $or:[
                {userId:this._id},
                {isTeamAccount:true,userId:null}
            ]

        }).fetch()
    },

    isAdmin() {
        return Roles.userIsInRole(this._id, ROLES.ADMIN)
    },

    name() {
        if(this.profile) return `${this.profile.firstName} ${this.profile.lastName}`
        return null
    }

})

if(Meteor.isServer) {
    Accounts.onCreateUser((options, user) => {
        user.profile = {}
        if(options.profile) {
            const profile = options.profile

            if(profile.firstName)
            {
                user.profile.firstName = profile.firstName
            }
            if(profile.lastName)
            {
                user.profile.lastName = profile.lastName
            }
        }

        return user
    })
}

export default Meteor.users
