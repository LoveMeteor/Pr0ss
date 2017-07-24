import { Accounts } from 'meteor/accounts-base'

Accounts.validateLoginAttempt((doc) => {
	if (doc.user && doc.user.status === 'pending') throw new Meteor.Error('202', 'This account is pending')
	return doc
})
