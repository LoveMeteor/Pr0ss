import SimpleSchema from 'simpl-schema'
import { ValidatedMethod } from 'meteor/mdg:validated-method'

export default new ValidatedMethod({
  name: 'task.findUsers',
  validate: new SimpleSchema({
    keyword: { type: String },
    ignore: { type: String },
  }).validator(),
  run({ keyword, ignore }) {
    if (!this.userId) return []
    const $regex = new RegExp(keyword, 'i')
    return Meteor.users.find({
      _id: {
        $ne: ignore,
      },
      $or: [
        {
          username: { $regex },
        },
        {
          'emails.address': { $regex },
        },
        {
          'profile.firstName': { $regex },
        },
        {
          'profile.lastName': { $regex },
        }
      ],
    }, {
      fields: { username: 1, emails: 1, profile: 1 },
      limit: 3,
    }).fetch()
  },
})
