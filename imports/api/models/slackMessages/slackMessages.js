const SlackMessages = new Mongo.Collection('SlackMessages');

SlackMessages.before.insert(function (userId, doc) {
    if(!doc.user) return;
    const user = Meteor.users.findOne({'slack.id': doc.user});
    if(!user) return;
    return doc.userId = user._id;
});

export default SlackMessages;
