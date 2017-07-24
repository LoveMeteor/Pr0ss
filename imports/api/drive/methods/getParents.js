import { drive } from './drive';
import SimpleSchema from 'simpl-schema';

export default new ValidatedMethod({
  name: 'drive.getParents',
  validate: new SimpleSchema({
    fileId: { type: String }
  }).validator(),
  run({ fileId }) {
    const params = { fileId: fileId, fields: 'parents' };
    return Meteor.wrapAsync(drive.files.get)(params);
  }
})


