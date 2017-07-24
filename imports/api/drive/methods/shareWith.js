import { drive } from './drive';
import SimpleSchema from 'simpl-schema';

export default new ValidatedMethod({
  name: 'drive.shareWith',
  validate: new SimpleSchema({
    fileId: String,
    email: String,
  }).validator(),
  run({ fileId, email }) {
    const params = {
      fileId,
      sendNotificationEmail: true,
      resource: {
        emailAddress: email,
        role: 'writer',
        type: 'user',
      },
    };
    return Meteor.wrapAsync(drive.permissions.create)(params);
  },
});
