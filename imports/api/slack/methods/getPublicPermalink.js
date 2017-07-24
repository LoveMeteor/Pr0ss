import { Meteor } from 'meteor/meteor'
import SimpleSchema from 'simpl-schema'
import slackClient from '../restful'

Meteor.methods({
  getPublicPermalink(fileId) {
    new SimpleSchema({
      fileId: String,
    }).validate({ fileId })

    const { data: { ok, file } } = slackClient.files.sharedPublicURL({ file: fileId })
    if (!ok) return

    return file.permalink_public
  },
})
