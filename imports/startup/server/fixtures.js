//import {resetDatabase} from 'meteor/xolvio:cleaner';
import {Roles} from 'meteor/alanning:roles'
import { Factory } from 'meteor/dburles:factory'
import _ from 'underscore'
import { ROLES, SalesRecords, Quotes} from '../../api/models'

function createBaseData() {
    // 1. Generate user data
    const administrator = {
        username: 'admin',
        email: 'admin@prossimo.com',
        emailProvider: 'eas',
        password: 'prossimo2017',
        profile: {
            firstName: 'Prossimo',
            lastName: 'Admin'
        }
    }
    const adminId = Accounts.createUser(administrator)
    Roles.addUsersToRoles(adminId, [ROLES.ADMIN])

    const user1 = {
        username: 'prossimo1',
        email: 'quotes@prossimo.us',
        emailProvider: 'gmail',
        password: 'P4ssiveH0use',
        profile: {
            firstName: 'Quote',
            lastName: 'User'
        }
    }
    const userId1 = Accounts.createUser(user1)
    Roles.addUsersToRoles(userId1, [ROLES.SALES])

    console.log('=========== Created user data ===========')

    // 2. Generate salesRecord data

    _.times(10, () => {
        Factory.create('salesRecord')
    })

    console.log('=========== Created salesRecord data ===========')

    const quoteList = [
        {
            name: 'Quote #1',
            revisionNumber: 'active',
            active: true,
            fileLink: '',
            createAt: new Date()
        },
            {
                name: 'Quote 2',
                status: 'delivered',
                active: false,
                fileLink: '',
                createAt: new Date()
            }
        ]
    quoteList.forEach(item => {
        Quotes.insert(item)
    })
    console.log('=========== Created quote data ===========')

}

if (Meteor.isAppTest) {
    // resetDatabase();

    createBaseData()
}
