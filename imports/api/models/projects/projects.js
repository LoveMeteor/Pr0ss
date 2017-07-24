import { Mongo } from 'meteor/mongo'
import SimpleSchema from 'simpl-schema'

const Projects = new Mongo.Collection('Projects')

Projects.schema = new SimpleSchema({
  _id: { type: String },
  members: {
    type: Array,
  },
  name: {
    type: String,
  },
  members: {
    type: Array,
  },
  'members.$': {
    type: Object,
  },
  'members.$.userId': {
    type: String,
  },
  'members.$.isAdmin': {
    type: Boolean,
  },
  slackChanel: {
    type: String,
    optional: true,
  },
  folderId: {
    type: String,
    optional: true,
  },
  taskFolderId: {
    type: String,
    optional: true,
  },
})

Projects.attachSchema(Projects.schema)
export default Projects
