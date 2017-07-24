import SimpleSchema from 'simpl-schema'
import Events from '../events/events'
import Files from '../files/files'

const Quotes = new Mongo.Collection('Quotes')

Quotes.attachSchema(
  new SimpleSchema({
    _id: String,
    name: String,
    createAt: Date,
    projectId: String,
    createBy: String,
    revisions: Array,
    'revisions.$': Object,
    'revisions.$.revisionNumber': Number,
    'revisions.$.totalPrice': Number,
    'revisions.$.fileName': String,
    'revisions.$.fileId': String,
    'revisions.$.createBy': String,
    'revisions.$.createAt': Date,
  })
)

Quotes.after.insert((userId, doc) => {
  const event = {
    name: `Add new quote "${doc.name}"`,
    createAt: doc.createAt,
    projectId: doc.projectId,
    createBy: doc.createBy
  }
  Events.insert(event)
})

Quotes.after.update((userId, doc) => {
  const event = {
    name: `update quote "${doc.name}"`,
    createAt: doc.createAt,
    projectId: doc.projectId,
    createBy: doc.createBy
  }
  Events.insert(event)
})

Quotes.after.remove((userId, doc) => {
  const event = {
    name: `remove quote "${doc.name}"`,
    createAt: new Date(),
    projectId: doc.projectId,
    createBy: doc.createBy,
  }
  const filesId = doc.revisions.map(item => item.fileId)
  Events.insert(event)
  Files.remove({_id: {$in: filesId}})
})

export default Quotes
