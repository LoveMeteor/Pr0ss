import {Meteor} from 'meteor/meteor'
import {GET_COMPANIES, GET_COMPANY_TYPES} from '../../constants/collections'
import Companies from './companies'
import CompanyTypes from '../companies/companytypes'


Meteor.publish(GET_COMPANIES, function() {
    if(!this.userId) {
        this.ready()
        return
    }
    return Companies.find({})
})

Meteor.publish(GET_COMPANY_TYPES, function() {
    if(!this.userId) {
        this.ready()
        return
    }

    return CompanyTypes.find({$or:[{user_id:null},{user_id:this.userId}]})
})