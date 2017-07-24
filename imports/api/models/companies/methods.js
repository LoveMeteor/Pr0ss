import {_} from 'meteor/underscore'
import { Meteor } from 'meteor/meteor'
import {Roles} from 'meteor/alanning:roles'
import { ValidatedMethod } from 'meteor/mdg:validated-method'
import SimpleSchema from 'simpl-schema'
import Companies from './companies'
import CompanyTypes from './companytypes'
import {ROLES} from '../users/users'


export const insertCompany = new ValidatedMethod({
    name: 'companies.insert',
    validate: Companies.schema.pick('name','website','type_ids','phone_numbers','addresses').validator({clean:true}),
    run({name, website, type_ids, phone_numbers, addresses}) {
        if(!this.userId) throw new Meteor.Error(403, 'Not authorized')

        const data = {
            name,
            website,
            type_ids,
            phone_numbers,
            addresses,
            user_id: this.userId
        }

        return Companies.insert(data)
    }
})

export const updateCompany = new ValidatedMethod({
    name: 'companies.update',
    validate: Companies.schema.pick('_id','name','website','type_ids','phone_numbers','addresses').validator({clean:true}),
    run({_id, name, website, type_ids, phone_numbers, addresses}) {
        if(!this.userId) throw new Meteor.Error(403, 'Not authorized')

        const company = Companies.findOne({_id})
        if(!company) throw new Meteor.Error(`Not found company with _id ${_id}`)

        if(company.user_id!==this.userId) throw new Meteor.Error('Permission denied')

        const data = {
            name: _.isUndefined(name) ? null : name,
            website: _.isUndefined(website) ? null : website,
            type_ids: _.isUndefined(type_ids) ? [] : type_ids,
            phone_numbers: _.isUndefined(phone_numbers) ? [] : phone_numbers,
            addresses: _.isUndefined(addresses) ? [] : addresses,
            user_id: this.userId
        }

        return Companies.update({_id}, {$set:data})
    }
})

export const removeCompany = new ValidatedMethod({
    name: 'companies.remove',
    validate: new SimpleSchema({_id:Companies.schema.schema('_id')}).validator({clean:true}),
    run({_id}) {
        if(!this.userId) throw new Meteor.Error(403, 'Not authorized')

        const company = Companies.findOne({_id})
        if(!company) throw new Meteor.Error(`Not found company with _id ${_id}`)

        if(company.user_id!==this.userId) throw new Meteor.Error('Permission denied')

        Companies.remove(_id)
    }
})

export const insertCompanyType = new ValidatedMethod({
    name: 'company.types.insert',
    validate: CompanyTypes.schema.pick('name').validator({clean:true}),
    run({name}) {
        if(!this.userId) throw new Meteor.Error(403, 'Not authorized')

        const type = CompanyTypes.findOne({name})
        if(type) throw new Meteor.Error('Duplicated type name')

        const data = {
            name
        }

        if(!Roles.userIsInRole(this.userId, [ROLES.ADMIN])) data.user_id = this.userId
        return CompanyTypes.insert(data)
    }
})

export const updateCompanyType = new ValidatedMethod({
    name: 'company.types.update',
    validate: CompanyTypes.schema.pick('_id','name').validator({clean:true}),
    run({_id, name}) {
        if(!this.userId) throw new Meteor.Error(403, 'Not authorized')

        const companyType = CompanyTypes.findOne({_id})
        if(!companyType) throw new Meteor.Error(`Not found company type with _id ${_id}`)

        if(!Roles.userIsInRole(this.userId, [ROLES.ADMIN]) && (!companyType.user_id || companyType.user_id!==this.userId))
            throw new Meteor.Error('Permission denied')

        const type = CompanyTypes.findOne({name})
        if(type && type._id !== companyType._id) throw new Meteor.Error('Duplicated type name')

        const data = {
            name: _.isUndefined(name) ? null : name
        }

        return CompanyTypes.update({_id}, {$set:data})
    }
})

export const removeCompanyType = new ValidatedMethod({
    name: 'company.types.remove',
    validate: new SimpleSchema({_id:CompanyTypes.schema.schema('_id')}).validator({clean:true}),
    run({_id}) {
        if(!this.userId) throw new Meteor.Error(403, 'Not authorized')
        const companyType = CompanyTypes.findOne({_id})
        if(!companyType) throw new Meteor.Error(`Not found company type with _id ${_id}`)

        if(!Roles.userIsInRole(this.userId, [ROLES.ADMIN]) && (!companyType.user_id || companyType.user_id!==this.userId))
            throw new Meteor.Error('Permission denied')

        CompanyTypes.remove(_id)
    }
})