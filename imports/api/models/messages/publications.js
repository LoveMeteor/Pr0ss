import {Meteor} from 'meteor/meteor'
import Messages from './messages'

Meteor.publish('MyMessages', function() {
    if(!this.userId) {
        this.ready()
        return
    }

    const nylasAccounts = Meteor.users.findOne({_id:this.userId}).nylasAccounts()
    return Messages.find({account_id:{$in:_.pluck(nylasAccounts, 'accountId')}})
})
