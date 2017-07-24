import { drive } from './drive';
import SimpleSchema from 'simpl-schema';

export default new ValidatedMethod({
  name: 'drive.createFile',
  validate: new SimpleSchema({
    name: { type: String },
    filetype: { type: String },
    parent: { type: String, optional: true },
  }).validator(),
  run({ name, filetype, parent }) {
    const parents = parent ? [parent] : [];
    const params = {
      resource: {
        name,
        mimeType: filetype,
        parents,
      },
      fields: '*',
    };
    return Meteor.wrapAsync(drive.files.create)(params);
  }
})


