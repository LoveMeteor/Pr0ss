import {Meteor} from 'meteor/meteor'
import _ from 'underscore'
import SimpleSchema from 'simpl-schema'
import slackClient, {ERROR} from '../restful'

Meteor.methods({
    inviteUserToSlack(email) {
        check(email, String)
        new SimpleSchema({
            email: {
                type: String,
                regEx: SimpleSchema.RegEx.Email,
            }
        }).validate({email})

        const result = slackClient.users.admin.invite({email})

        if(!result.data) return

        if (result.data.error === ERROR.AlreadyInTeam) {
            let cursor
            while (1) {
                const data = Meteor.call('getSlackUsers', cursor)

                if (!data.ok) break
                if (!data.members) break
                if (_.findWhere(_.pluck(data.members, 'profile'), {email})) break
                if (!data.cursor) break

                cursor = data.cursor
            }

        }
        Meteor.users.update({'emails.address': email}, {$set:{slackInvited:true}})

    },
})
