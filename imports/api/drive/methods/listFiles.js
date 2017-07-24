import { drive } from './drive';
import SimpleSchema from 'simpl-schema';

export default new ValidatedMethod({
    name: 'drive.listFiles',
    validate: new SimpleSchema({
        query: { type: String, optional: true }
    }).validator(),
    run({ query, parent }) {
        const params = query ? { q: query } : {};
        params.fields = 'files';
        return Meteor.wrapAsync(drive.files.list)(params);
    }
})


