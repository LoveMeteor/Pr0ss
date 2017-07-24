import {Meteor} from 'meteor/meteor'
import Conversations from './conversations'

Meteor.publish('Conversations', function() {
    if(!this.userId) {
        this.ready()
        return
    }

    return Conversations.find({})
})

