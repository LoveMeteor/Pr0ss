import { Meteor } from 'meteor/meteor'
import { SlackMessages } from '/imports/api/models'

Meteor.methods({
  addSlackFileMsg(data) {
    check(data, Object)
    check(data.file, Object)
    check(data.file.id, String)

    data.publicLink = Meteor.call('getPublicPermalink', data.file.id)
    SlackMessages.insert(data)
  },
})
