import { Settings } from '/imports/api/models';

Meteor.publish('settings.all', function () {
  return Settings.find();
});
