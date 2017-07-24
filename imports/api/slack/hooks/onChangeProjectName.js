import { Projects } from '/imports/api/models'
import slackClient from '../restful'
import { Random } from 'meteor/random'
import { Meteor } from 'meteor/meteor'

Projects.before.update((userId, doc, fieldNames, modifier) => {
  if (fieldNames.includes('name')) {
    if (modifier.$set && modifier.$set.name) {
      const { name, slackChanel } = doc
      const newName = modifier.$set.name
      if (newName !== name) {
        Meteor.defer(() => {
          const { data: { ok } } = slackClient.channels.rename({
            name: newName,
            channel: slackChanel,
          })
          if (!ok) {
            slackClient.channels.rename({
              name: `${newName}-${Random.id()}`,
              channel: slackChanel,
            })
          }
        })
      }
    }
  }
})

