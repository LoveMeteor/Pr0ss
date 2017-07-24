import { Meteor } from 'meteor/meteor'
import { SlackMessages } from '/imports/api/models'

Meteor.methods({
  parseSlackMessage(data) {
    check(data, Object)

    data.createAt = new Date()
    switch (data.subtype) {
      case 'file_share':
        return Meteor.call('addSlackFileMsg', data)
      default:
        SlackMessages.insert(data)
    }
  },
})

