const SlackUsers = new Mongo.Collection('SlackUsers');

SlackUsers.after.insert(function (userId, doc) {
    const email = doc.profile.email;
    if(!email) return;
    const user = Accounts.findUserByEmail(email);
    if(!user) return;
    Meteor.users.update({_id: user._id},{
        $set: {
            'slack': doc
        }
    })
});

export default SlackUsers;
