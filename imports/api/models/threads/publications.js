import {Meteor} from 'meteor/meteor'
import Threads from './threads'

Meteor.publish('MyThreads', function() {
    if(!this.userId) {
        this.ready()
        return
    }

    const nylasAccounts = Meteor.users.findOne({_id:this.userId}).nylasAccounts()
    return Threads.find({account_id:{$in:_.pluck(nylasAccounts, 'accountId')}})
})
