import { drive } from './drive';
import SimpleSchema from 'simpl-schema';

export default new ValidatedMethod({
    name: 'drive.createFolder',
    validate: new SimpleSchema({
        name: { type: String },
        parent: { type: String, optional: true },
    }).validator(),
    run({ name, parent }) {
        const parents = parent ? [parent] : [];
        const params = {
            resource: {
                name,
                mimeType: 'application/vnd.google-apps.folder',
                parents,
            },
        };
        return Meteor.wrapAsync(drive.files.create)(params);
    }
})


