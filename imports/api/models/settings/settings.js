import { Mongo } from 'meteor/mongo';
import SimpleSchema from 'simpl-schema';

const Settings = new Mongo.Collection('Settings');

Settings.schema = new SimpleSchema({
  _id: {
    type: String,
  },
  userId: {
    type: String,
    optional: true,
  },
  key: {
    type: String,
  },
  show: {
    type: Array,
    optional: true,
  },
  'show.$': {
    type: String,
    optional: true,
  },
  value: {
    type: String,
    optional: true,
  },
});

Settings.attachSchema(Settings.schema);

export default Settings;
