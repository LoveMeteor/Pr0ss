import _ from 'underscore'
import { Meteor } from 'meteor/meteor'
import {Roles} from 'meteor/alanning:roles'
import { ValidatedMethod } from 'meteor/mdg:validated-method'
import SimpleSchema from 'simpl-schema'
import People from './people'
import Designations from './designations'
import Contacts from '../contacts/contacts'
import {ROLES} from '../users/users'

export const insertPerson = new ValidatedMethod({
    name: 'people.insert',
    validate: People.schema.pick('name','twitter','facebook','linkedin','designation_id','role','is_user','emails','phone_numbers','company_id','position').extend({contact_id: {type: String, regEx: SimpleSchema.RegEx.Id, optional: true}}).validator({clean:true}),
    run({name, twitter, facebook, linkedin, designation_id, role, is_user, emails, phone_numbers, company_id, position, contact_id}) {
        if(!this.userId) throw new Meteor.Error(403, 'Not authorized')

        const uniquedEmails = _.uniq(emails, true, ({email}) => email)
        if(uniquedEmails.length !== emails.length) throw new Meteor.Error('Duplicated email')

        const defaultEmails = _.filter(emails, ({is_default}) => is_default)
        if(defaultEmails.length > 1) throw new Meteor.Error('Duplicated default emails')

        const uniquedPhoneNumbers = _.uniq(phone_numbers, true, ({number}) => number)
        if(uniquedPhoneNumbers.length !== phone_numbers.length) throw new Meteor.Error('Duplicated phone number')

        const defaultPhoneNumbers = _.filter(phone_numbers, ({is_default}) => is_default)
        if(defaultPhoneNumbers.length > 1) throw new Meteor.Error('Duplicated default phone numbers')

        const existingPeople = People.find({'emails.email':{$in:_.pluck(emails, 'email')}}).fetch()
        if(existingPeople && existingPeople.length) throw new Meteor.Error('Person with same email is exist')

        const data = {
            name, twitter, facebook, linkedin, designation_id, role, is_user, emails, phone_numbers, company_id, position,
            user_id: this.userId
        }

        const person_id =  People.insert(data)

        if(contact_id) {
            Contacts.update({_id:contact_id}, {$set:{person_id}})
        }
        return person_id
    }
})

export const updatePerson = new ValidatedMethod({
    name: 'people.update',
    validate: People.schema.pick('_id','name','twitter','facebook','linkedin','designation_id','role','is_user','emails','phone_numbers','company_id','position').validator({clean:true}),
    run({_id, name, twitter, facebook, linkedin, designation_id, role, is_user, emails, phone_numbers, company_id, position}) {
        if(!this.userId) throw new Meteor.Error(403, 'Not authorized')

        const person = People.findOne({_id})
        if(!person) throw new Meteor.Error(`Not found person with _id ${_id}`)

        //if(!Roles.userIsInRole(this.userId, ROLES.ADMIN)) throw new Meteor.Error('Permission denied')

        const uniquedEmails = _.uniq(emails, true, ({email}) => email)
        if(uniquedEmails.length !== emails.length) throw new Meteor.Error('Duplicated email')

        const defaultEmails = _.filter(emails, ({is_default}) => is_default)
        if(defaultEmails.length > 1) throw new Meteor.Error('Duplicated default emails')

        const uniquedPhoneNumbers = _.uniq(phone_numbers, true, ({number}) => number)
        if(uniquedPhoneNumbers.length !== phone_numbers.length) throw new Meteor.Error('Duplicated phone number')

        const defaultPhoneNumbers = _.filter(phone_numbers, ({is_default}) => is_default)
        if(defaultPhoneNumbers.length > 1) throw new Meteor.Error('Duplicated default phone numbers')

        const existingPeople = People.findOne({'emails.email':{$in:_.pluck(emails, 'email')}})
        if(existingPeople && existingPeople._id!==person._id) throw new Meteor.Error('Person with same email is exist')

        const data = {
            name: _.isUndefined(name) ? null : name,
            twitter: _.isUndefined(twitter) ? null : twitter,
            facebook: _.isUndefined(facebook) ? null : facebook,
            linkedin: _.isUndefined(linkedin) ? null : linkedin,
            designation_id: _.isUndefined(designation_id) ? null : designation_id,
            role: _.isUndefined(role) ? null : role,
            is_user: _.isUndefined(is_user) ? false : is_user,
            emails: _.isUndefined(emails) ? [] : emails,
            phone_numbers: _.isUndefined(phone_numbers) ? [] : phone_numbers,
            company_id: _.isUndefined(company_id) ? null : company_id,
            position: _.isUndefined(position) ? null : position,
            user_id: this.userId
        }

        return People.update({_id}, {$set:data})
    }
})

export const removePerson = new ValidatedMethod({
    name: 'people.remove',
    validate: new SimpleSchema({_id:People.schema.schema('_id')}).validator({clean:true}),
    run({_id}) {
        if(!this.userId) throw new Meteor.Error(403, 'Not authorized')

        const person = People.findOne({_id})
        if(!person) throw new Meteor.Error(`Not found person with _id ${_id}`)

        //if(!Roles.userIsInRole(this.userId, [ROLES.ADMIN])) throw new Meteor.Error('Permission denied')

        People.remove(_id)
    }
})

export const insertPeople = new ValidatedMethod({
    name: 'people.bulkinsert',
    validate: new SimpleSchema({
        people: {type: Array},
        'people.$': {type: Object},
        'people.$.name': People.schema.schema('name'),
        'people.$.email': People.Email.schema('email'),
        'people.$.designation_id': People.schema.schema('designation_id'),
        'people.$.role': People.schema.schema('role'),
        'people.$.company_id': People.schema.schema('company_id'),
        'people.$.position': People.schema.schema('position'),
        'people.$.contact_id': {type: String, regEx: SimpleSchema.RegEx.Id, optional: true}
    }).validator({clean:true,filter:false}),
    run({people}) {
        if(!this.userId) throw new Meteor.Error(403, 'Not authorized')

        const uniquedEmails = _.uniq(_.pluck(people, 'email'))
        if(uniquedEmails.length !== people.length) throw new Meteor.Error('Duplicated email')

        const existingPeople = People.find({'emails.email':{$in:uniquedEmails}}).fetch()
        if(existingPeople && existingPeople.length) throw new Meteor.Error('Person with same email is exist')


        const ids = []
        people.forEach((p) => {
            const person = _.clone(p)
            person.user_id = this.userId

            person.emails = [{email:person.email, is_default:true}]
            delete person.email

            const contactId = person.contact_id
            delete person.contact_id

            const personId = People.insert(person)

            if(contactId) {
                Contacts.update({_id:contactId}, {$set:{person_id:personId}})
            }
            ids.push(personId)
        })

        return ids
    }
})


export const insertDesignation = new ValidatedMethod({
    name: 'people.designations.insert',
    validate: Designations.schema.pick('name','role_addable','roles').validator({clean:true}),
    run({name, role_addable, roles}) {
        if(!this.userId) throw new Meteor.Error(403, 'Not authorized')
        if(!Roles.userIsInRole(this.userId, [ROLES.ADMIN])) throw new Meteor.Error('Permission denied')

        const uniquedRoles = _.uniq(roles, true, ({name}) => name)
        if(uniquedRoles.length !== roles.length) throw new Meteor.Error('Duplicated role name')

        const data = {
            name, role_addable, roles
        }

        return Designations.insert(data)
    }
})

export const updateDesignation = new ValidatedMethod({
    name: 'people.designations.update',
    validate: Designations.schema.pick('_id','name','role_addable','roles').validator({clean:true}),
    run({_id, name, role_addable, roles}) {
        if(!this.userId) throw new Meteor.Error(403, 'Not authorized')
        if(!Roles.userIsInRole(this.userId, [ROLES.ADMIN])) throw new Meteor.Error('Permission denied')

        const designation = Designations.findOne({_id})
        if(!designation) throw new Meteor.Error(`Not found designation with _id ${_id}`)

        const uniquedRoles = _.uniq(roles, true, ({name}) => name)
        if(uniquedRoles.length !== roles.length) throw new Meteor.Error('Duplicated role name')


        const data = {
            name: _.isUndefined(name) ? null : name,
            role_addable: _.isUndefined(role_addable) ? false : role_addable,
            roles: _.isUndefined(roles) ? [] : roles
        }

        return Designations.update({_id}, {$set:data})
    }
})

export const removeDesignation = new ValidatedMethod({
    name: 'people.designations.remove',
    validate: new SimpleSchema({_id:Designations.schema.schema('_id')}).validator({clean:true}),
    run({_id}) {
        if(!this.userId) throw new Meteor.Error(403, 'Not authorized')
        if(!Roles.userIsInRole(this.userId, [ROLES.ADMIN])) throw new Meteor.Error('Permission denied')

        const designation = Designations.findOne({_id})
        if(!designation) throw new Meteor.Error(`Not found designation with _id ${_id}`)

        Designations.remove(_id)
    }
})

export const removeRole = new ValidatedMethod({
    name: 'people.designations.removeRole',
    validate: new SimpleSchema({_id:Designations.schema.schema('_id'), roleName:{type:String}}).validator({clean:true}),
    run({_id, roleName}) {
        if(!this.userId) throw new Meteor.Error(403, 'Not authorized')
        if(!Roles.userIsInRole(this.userId, [ROLES.ADMIN])) throw new Meteor.Error('Permission denied')

        const designation = Designations.findOne({_id})
        if(!designation) throw new Meteor.Error(`Not found designation with _id ${_id}`)

        const roles = designation.roles
        if(roles && roles.length) {
            const index = _.findIndex(roles, {name:roleName})
            if(index > -1) {
                const roleObj = roles[index]
                if(!roleObj.is_custom) throw new Meteor.Error('Could not delete non custom role')
                roles.splice(index, 1)
                Designations.update(_id, {$set:{roles}})
            }
        }


    }
})