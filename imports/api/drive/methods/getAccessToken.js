import { oauth2Client } from './drive';
import SimpleSchema from 'simpl-schema';

let token = null;

export default new ValidatedMethod({
    name: 'drive.getAccessToken',
    validate: new SimpleSchema({}).validator(),
    run() {
        if (token && token.expiry_date > Date.now()) return token.access_token;
        const refreshAccessTokenSync = Meteor.wrapAsync((callback)=> {
            oauth2Client.refreshAccessToken((error, token)=> {
                callback(error, token);
            });
        });
        token = refreshAccessTokenSync();
        return token.access_token;
    }
});
