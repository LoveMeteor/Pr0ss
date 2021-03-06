import {_} from 'meteor/underscore'
import {Meteor} from 'meteor/meteor'
import {chai, assert} from 'meteor/practicalmeteor:chai'
import {resetDatabase} from 'meteor/xolvio:cleaner'
import {Factory} from 'meteor/dburles:factory'
import People from './people'
import Designations from './designations'
import Contacts from '../contacts/contacts'
import { createAdminUser } from '/imports/api/models/users/methods'
import { insertPerson, updatePerson, removePerson, insertPeople, insertDesignation, updateDesignation, removeDesignation, removeRole } from './methods'

if(Meteor.isServer) {
    describe('people.desinations', () => {
        let adminId
        beforeEach(() => {
            resetDatabase()
            adminId = createAdminUser()
        })

        const data = {
            name: 'Team Member',
            role_addable: false,
            roles: [{name:'Admin'}, {name:'Manager'}, {name:'Sales'}, {name:'Takeoffs'}, {name:'Arch', is_custom:true}]
        }

        it('should insert designation correctly by factory and method', () => {
            let designation = Factory.create('designation')
            assert.typeOf(designation, 'object')
            assert.typeOf(designation.created_at, 'date')

            const designationId = insertDesignation._execute({userId:adminId}, data)

            assert.typeOf(designationId, 'string')

            designation = Designations.findOne({_id:designationId})

            assert.equal(designation.name, data.name)
            assert.equal(designation.role_addable, data.role_addable)
            assert.typeOf(designation.roles, 'array')
            assert.equal(designation.roles.length, data.roles.length)
        })

        it('should update designation correctly by method', () => {
            const _id = insertDesignation._execute({userId:adminId}, data)

            const data1 = {
                _id,
                name: 'Stakeholder',
                role_addable: true,
                roles: [{name:'Developer'}, {name:'Architectect'}, {name:'GC'}, {name:'Contractor'}, {name:'Installer'}, {name:'Energy Consultant', is_custome:true}, {name:'Facade Consultant', is_custome:true}]
            }
            const results = updateDesignation._execute({userId:adminId}, data1)

            assert.equal(results, 1)

            const designation = Designations.findOne(_id)

            assert.equal(designation.name, data1.name)
            assert.equal(designation.role_addable, data1.role_addable)
            assert.typeOf(designation.roles, 'array')
            assert.equal(designation.roles.length, data1.roles.length)
        })

        it('should remove designation correctly by method', () => {
            const _id = insertDesignation._execute({userId:adminId}, data)

            removeDesignation._execute({userId:adminId}, {_id})

            const designation = Designations.findOne({_id})
            assert.equal(designation, null)
        })

        it('should remove custom role correctly by method', () => {
            const _id = insertDesignation._execute({userId:adminId}, data)

            removeRole._execute({userId:adminId}, {_id, roleName:'Arch'})

            const designation = Designations.findOne({_id})
            assert.equal(designation.roles.length, data.roles.length-1)
        })

        it('should not remove non custom role', () => {
            const _id = insertDesignation._execute({userId:adminId}, data)

            assert.throws(() => {
                removeRole._execute({userId:adminId}, {_id, roleName:'Admin'})
            }, Meteor.Error())

        })
    })

    describe('people', () => {
        let adminId
        beforeEach(() => {
            resetDatabase()
            adminId = createAdminUser()
        })



        it('should insert person correctly by factory and method', () => {
            let person = Factory.create('person')
            assert.typeOf(person, 'object')
            assert.typeOf(person.created_at, 'date')

            const data = {
                name: 'John Smith',
                twitter: 'http://www.twitter.com/john',
                facebook: 'http://www.facebook.com/john',
                linkedin: 'http://www.linkedin.com/john',
                designation_id: Factory.create('designation')._id,
                role: 'Manager',
                emails: [{
                    email: 'john@prossimo.us.office',
                    type: 'office',
                    is_default: true
                }],
                phone_numbers: [{
                    number: '1-234-5678',
                    type: 'office',
                    is_default: true
                }],
                company_id: Factory.create('company')._id,
                position: 'Project Manager'
            }
            const personId = insertPerson._execute({userId:adminId}, data)

            assert.typeOf(personId, 'string')

            person = People.findOne({_id:personId})

            assert.equal(person.name, data.name)
            assert.equal(person.twitter, data.twitter)
            assert.equal(person.facebook, data.facebook)
            assert.equal(person.linkedin, data.linkedin)
            assert.equal(person.designation_id, data.designation_id)
            assert.equal(person.role, data.role)
            assert.typeOf(person.phone_numbers, 'array')
            assert.equal(person.phone_numbers.length, 1)
            assert.deepEqual(person.phone_numbers[0], data.phone_numbers[0])
            assert.typeOf(person.emails, 'array')
            assert.equal(person.emails.length, 1)
            assert.deepEqual(person.emails[0], data.emails[0])
            assert.equal(person.company_id, data.company_id)
            assert.equal(person.position, data.position)
        })

        it('should not insert person with invalid data', () => {
            const data = {
                name: 'John Smith',
                twitter: 'http://www.twitter.com/john',
                facebook: 'http://www.facebook.com/john',
                linkedin: 'http://www.linkedin.com/john',
                emails: [{
                    email: 'john@prossimo.us.office',
                    type: 'office',
                    is_default: true
                }],
                phone_numbers: [{
                    number: '1-234-5678',
                    type: 'office',
                    is_default: true
                }],
                company_id: Factory.create('company')._id,
                position: 'Project Manager'
            }
            // no designation_id and role
            assert.throws(() => {
                insertPerson._execute({userId:adminId}, data)
            }, Meteor.Error())
            data.designation_id = Factory.create('designation')._id
            data.role = 'Manager'
            // duplicated email
            assert.throws(() => {
                insertPerson._execute({userId:adminId}, _.clone(data).emails.push({
                    email: 'john@prossimo.us.office',
                    type: 'home',
                    is_default: false
                }))
            }, Meteor.Error())

            // duplicated email.is_default true
            assert.throws(() => {
                insertPerson._execute({userId:adminId}, _.clone(data).emails.push({
                    email: 'john@prossimo.us.office1',
                    type: 'home',
                    is_default: true
                }))
            }, Meteor.Error())

            // duplicated phone_number
            assert.throws(() => {
                insertPerson._execute({userId:adminId}, _.clone(data).phone_numbers.push({
                    number: '1-234-5678',
                    type: 'office',
                    is_default: false
                }))
            }, Meteor.Error())

            // duplicated phone_number.is_default
            assert.throws(() => {
                insertPerson._execute({userId:adminId}, _.clone(data).phone_numbers.push({
                    number: '2-234-5678',
                    type: 'office',
                    is_default: true
                }))
            }, Meteor.Error())

            // existing person with same email
            const person = Factory.create('person')
            assert.throws(() => {
                insertPerson._execute({userId:adminId}, _.clone(data).emails.push({
                    email: person.emails[0].email,
                    type: 'home',
                    is_default: false
                }))
            }, Meteor.Error())

        })

        it('should update person correctly by method', () => {
            const data = {
                name: 'John Smith',
                twitter: 'http://www.twitter.com/john',
                facebook: 'http://www.facebook.com/john',
                linkedin: 'http://www.linkedin.com/john',
                designation_id: Factory.create('designation')._id,
                role: 'Manager',
                emails: [{
                    email: 'john@prossimo.us.office',
                    type: 'office',
                    is_default: true
                }],
                phone_numbers: [{
                    number: '1-234-5678',
                    type: 'office',
                    is_default: true
                }],
                company_id: Factory.create('company')._id,
                position: 'Project Manager'
            }
            const _id = insertPerson._execute({userId:adminId}, data)

            const updateData = {
                _id,
                name: 'John Smith1',
                twitter: 'http://www.twitter.com/john1',
                facebook: 'http://www.facebook.com/john1',
                linkedin: 'http://www.linkedin.com/john1',
                designation_id: Factory.create('designation')._id,
                role: 'Manager1',
                emails: [{
                    email: 'john1@prossimo.us.office',
                    type: 'office1',
                    is_default: true
                }],
                phone_numbers: [{
                    number: '1-234-56789',
                    type: 'office1',
                    is_default: true
                }],
                company_id: Factory.create('company')._id,
                position: 'Project Manager1'
            }
            const results = updatePerson._execute({userId:adminId}, updateData)

            assert.equal(results, 1)

            const person = People.findOne(_id)

            assert.equal(person.name, updateData.name)
            assert.equal(person.twitter, updateData.twitter)
            assert.equal(person.facebook, updateData.facebook)
            assert.equal(person.linkedin, updateData.linkedin)
            assert.equal(person.designation_id, updateData.designation_id)
            assert.equal(person.role, updateData.role)
            assert.typeOf(person.phone_numbers, 'array')
            assert.equal(person.phone_numbers.length, 1)
            assert.deepEqual(person.phone_numbers[0], updateData.phone_numbers[0])
            assert.typeOf(person.emails, 'array')
            assert.equal(person.emails.length, 1)
            assert.deepEqual(person.emails[0], updateData.emails[0])
            assert.equal(person.company_id, updateData.company_id)
            assert.equal(person.position, updateData.position)
        })
        it('should not update person with invalid data', () => {
            const person = Factory.create('person')
            // duplicated emails
            const data = {
                _id: person._id,
                name: 'John Smith',
                twitter: 'http://www.twitter.com/john',
                facebook: 'http://www.facebook.com/john',
                linkedin: 'http://www.linkedin.com/john',
                designation_id: Factory.create('designation')._id,
                role: 'Manager',
                emails: [{
                    email: 'john@prossimo.us.office',
                    type: 'office',
                    is_default: true
                }],
                phone_numbers: [{
                    number: '1-234-5678',
                    type: 'office',
                    is_default: true
                }],
                company_id: Factory.create('company')._id,
                position: 'Project Manager'
            }

            // duplicated email
            assert.throws(() => {
                updatePerson._execute({userId:adminId}, _.clone(data).emails.push({
                    email: 'john@prossimo.us.office',
                    type: 'home',
                    is_default: false
                }))
            }, Meteor.Error())

            // duplicated email.is_default true
            assert.throws(() => {
                updatePerson._execute({userId:adminId}, _.clone(data).emails.push({
                    email: 'john@prossimo.us.office1',
                    type: 'home',
                    is_default: true
                }))
            }, Meteor.Error())

            // duplicated phone_number
            assert.throws(() => {
                updatePerson._execute({userId:adminId}, _.clone(data).phone_numbers.push({
                    number: '1-234-5678',
                    type: 'office',
                    is_default: false
                }))
            }, Meteor.Error())

            // duplicated phone_number.is_default
            assert.throws(() => {
                updatePerson._execute({userId:adminId}, _.clone(data).phone_numbers.push({
                    number: '2-234-5678',
                    type: 'office',
                    is_default: true
                }))
            }, Meteor.Error())

            // existing person with same email
            const person1 = Factory.create('person')
            assert.throws(() => {
                updatePerson._execute({userId:adminId}, _.clone(data).emails.push({
                    email: person1.emails[0].email,
                    type: 'home',
                    is_default: false
                }))
            }, Meteor.Error())

        })
        it('should remove person correctly by method', () => {

            const _id = Factory.create('person')._id

            removePerson._execute({userId:adminId}, {_id})

            const person = People.findOne({_id})
            assert.equal(person, null)
        })

        it('should insert people correctly by method from contacts', () => {
            let contact1 = Contacts.findOne(Contacts.insert({name:'John Smith', email:'johnsmith@gmail.com'}))
            let contact2 = Contacts.findOne(Contacts.insert({name:'Ben Cox', email:'bencox@gmail.com'}))

            const people = [{
                name: contact1.name,
                email: contact1.email,
                designation_id: Factory.create('designation')._id,
                role: 'Developer',
                company_id: Factory.create('company')._id,
                position: 'Team Manager',
                contact_id: contact1._id
            }, {
                name: contact2.name,
                email: contact2.email,
                designation_id: Factory.create('designation')._id,
                role: 'Customer',
                company_id: Factory.create('company')._id,
                position: 'Client',
                contact_id: contact2._id
            }]

            const ids = insertPeople._execute({userId:adminId}, {people})

            assert.typeOf(ids, 'array')

            const person1 = People.findOne({name: people[0].name})
            const person2 = People.findOne({name: people[1].name})

            assert.equal(person1.name, people[0].name)
            assert.equal(person1.emails[0].email, people[0].email)
            assert.equal(person1.designation_id, people[0].designation_id)
            assert.equal(person1.role, people[0].role)
            assert.equal(person1.company_id, people[0].company_id)
            assert.equal(person1.position, people[0].position)
            assert.equal(person2.name, people[1].name)
            assert.equal(person2.emails[0].email, people[1].email)
            assert.equal(person2.designation_id, people[1].designation_id)
            assert.equal(person2.role, people[1].role)
            assert.equal(person2.company_id, people[1].company_id)
            assert.equal(person2.position, people[1].position)

            contact1 = Contacts.findOne(contact1._id)
            assert.equal(contact1.person_id, person1._id)
            contact2 = Contacts.findOne(contact2._id)
            assert.equal(contact2.person_id, person2._id)
        })

    })
}