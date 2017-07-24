import {Meteor} from 'meteor/meteor'
import {
  GET_PEOPLE,
  GET_PEOPLE_DESIGNATIONS,
} from '../../constants/collections'
import People from './people'
import Designations from './designations'

Meteor.publish(GET_PEOPLE, function() {
    if(!this.userId) {
        this.ready()
        return
    }

    return People.find({})
})

Meteor.publish(GET_PEOPLE_DESIGNATIONS, function() {
    if(!this.userId) {
        this.ready()
        return
    }

    return Designations.find({})
})

