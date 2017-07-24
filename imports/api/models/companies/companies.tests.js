import {_} from 'meteor/underscore'
import {Meteor} from 'meteor/meteor'
import {chai, assert} from 'meteor/practicalmeteor:chai'
import {resetDatabase} from 'meteor/xolvio:cleaner'
import faker from 'faker'
import {Factory} from 'meteor/dburles:factory'
import { createAdminUser } from '/imports/api/models/users/methods'
import { insertCompany, updateCompany, removeCompany, insertCompanyType, updateCompanyType, removeCompanyType } from './methods'
import Companies from './companies'
import CompanyTypes from './companytypes'

if(Meteor.isServer) {
    describe('company.types', () => {
        let adminId
        beforeEach(() => {
            resetDatabase()
            adminId = createAdminUser()
        })

        it('should insert company type correctly by factory and method', () => {
            let companyType = Factory.create('companytype')
            assert.typeOf(companyType, 'object')
            assert.typeOf(companyType.created_at, 'date')

            const data = {
                name: 'Freight Forwarder'
            }

            const companyTypeId = insertCompanyType._execute({userId:adminId}, data)

            assert.typeOf(companyTypeId, 'string')

            companyType = CompanyTypes.findOne({_id:companyTypeId})
            assert.equal(companyType.name, data.name)
        })

        it('should update company type correctly by method', () => {
            let companyType = Factory.create('companytype')

            const _id = companyType._id

            const data = {
                _id,
                name: 'Freight Forwarder'
            }

            const results = updateCompanyType._execute({userId:adminId}, data)

            assert.equal(results, 1)

            companyType = CompanyTypes.findOne({_id})
            assert.equal(companyType.name, data.name)
        })

        it('should remove company type correctly by method', () => {
            let companyType = Factory.create('companytype')

            const _id = companyType._id

            removeCompanyType._execute({userId:adminId}, {_id})

            companyType = CompanyTypes.findOne({_id})
            assert.equal(companyType, null)
        })
    })

    describe('companies', () => {
        let adminId
        beforeEach(() => {
            resetDatabase()
            adminId = createAdminUser()
        })

        it('should insert company correctly by factory and method', () => {
            let company = Factory.create('company')
            assert.typeOf(company, 'object')
            assert.typeOf(company.created_at, 'date')

            const type_ids = [Factory.create('companytype')._id]
            const companyData = {
                name: faker.company.companyName(),
                website: faker.internet.url(),
                type_ids,
                phone_numbers: [{
                    number: faker.phone.phoneNumber(),
                    type:faker.random.word(),
                    is_default: true
                }],
                addresses: [{
                    address: faker.address.streetAddress(),
                    type: faker.random.word(),
                    is_default: true,
                    is_billing: true,
                    is_mail: true
                }]
            }

            const companyId = insertCompany._execute({userId:adminId}, companyData)

            assert.typeOf(companyId, 'string')

            company = Companies.findOne({_id:companyId})
            assert.equal(company.name, companyData.name)
            assert.equal(company.website, companyData.website)
            assert.deepEqual(company.type_ids, companyData.type_ids)
            assert.typeOf(company.phone_numbers, 'array')
            assert.equal(company.phone_numbers.length, 1)
            assert.deepEqual(company.phone_numbers[0], companyData.phone_numbers[0])
            assert.typeOf(company.addresses, 'array')
            assert.equal(company.addresses.length, 1)
            assert.deepEqual(company.addresses[0], companyData.addresses[0])
        })

        it('should update company correctly by method', () => {
            let data = {
                name: faker.company.companyName(),
                website: faker.internet.url(),
                type_ids: [Factory.create('companytype')._id],
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
            }

            const _id = insertCompany._execute({userId:adminId}, data)

            data = {
                _id,
                name: faker.company.companyName(),
                website: faker.internet.url(),
                type_ids: [Factory.create('companytype')._id],
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
            }
            const results = updateCompany._execute({userId:adminId}, data)

            assert.equal(results, 1)

            const company = Companies.findOne({_id})
            assert.equal(company.name, data.name)
            assert.equal(company.website, data.website)
            assert.deepEqual(company.type_ids, data.type_ids)
            assert.typeOf(company.phone_numbers, 'array')
            assert.equal(company.phone_numbers.length, 1)
            assert.deepEqual(company.phone_numbers[0], data.phone_numbers[0])
            assert.typeOf(company.addresses, 'array')
            assert.equal(company.addresses.length, 1)
            assert.deepEqual(company.addresses[0], data.addresses[0])
        })

        it('should remove company correctly by method', () => {
            let data = {
                name: faker.company.companyName(),
                website: faker.internet.url(),
                type_ids: [Factory.create('companytype')._id],
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
            }

            const _id = insertCompany._execute({userId:adminId}, data)

            removeCompany._execute({userId:adminId}, {_id})

            const company = Companies.findOne({_id})
            assert.equal(company, null)
        })
    })
}