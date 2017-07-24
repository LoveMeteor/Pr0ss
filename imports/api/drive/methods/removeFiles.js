import { drive } from './drive';
import SimpleSchema from 'simpl-schema';

export default new ValidatedMethod({
    name: 'drive.removeFiles',
    validate: new SimpleSchema({
        fileId: { type: String }
    }).validator(),
    run({ fileId }) {
        const params = { fileId };
        return Meteor.wrapAsync(drive.files.delete)(params);
    }
})
