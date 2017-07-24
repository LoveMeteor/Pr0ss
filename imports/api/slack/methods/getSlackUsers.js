import {Meteor} from 'meteor/meteor'
import {users} from '../restful'
import {SlackUsers} from '/imports/api/models'

Meteor.methods({
    getSlackUsers(cursor){
        check(cursor, Match.Maybe(String))

        const {data} = users.list(cursor)
        if (!data.ok) return
        data.members.forEach(
            item => SlackUsers.findOne({id: item.id}) && SlackUsers.insert(item)
        )

        return data
    }
})
