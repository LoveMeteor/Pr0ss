import {Meteor} from 'meteor/meteor'
import SimpleSchema from 'simpl-schema'
import slackClient from '../restful'
import {getUserEmail} from '/imports/api/lib/filters'

Meteor.methods({
    addUserToSlackChannel(userId, channel){
        check(userId, String)
        check(channel, String)


        const user = Meteor.users.findOne({_id: userId, slack: {$exists: true}})
        if (!user) throw new Meteor.Error('User don`t integrate with slack')
        const res = slackClient.channels.invite({channel, user: user.slack.id})
        if (!res.data.ok && res.data.error === 'already_in_channel') throw new Meteor.Error('User already in channel')
        res.userEmail = getUserEmail(user)
        return res
    }
})
