import SlackMails from './slackmails'


Meteor.methods({
    insertSlackMail(data)
    {
        check(data, {
            thread_id: String,
            thread_ts: String
        });

        return SlackMails.insert(data)
    }
});