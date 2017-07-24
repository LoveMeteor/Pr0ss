import { ValidatedMethod } from 'meteor/mdg:validated-method'
import SimpleSchema from 'simpl-schema'
import { Tasks } from '../../models'

export default new ValidatedMethod({
  name: 'task.updateComment',
  validate: new SimpleSchema({
    _id: {
      type: String,
    },
    content: {
      type: String,
      min: 1,
    },
  }).validator(),
  run({ _id, content }) {
    if (!this.userId) throw new Error('User is not allowed to add comment')
    return Tasks.update({ comments: { $elemMatch: { _id, userId: this.userId } } }, {
      $set: {
        'comments.$.content': content,
        'comments.$.updatedAt': new Date(),
      },
    })
  },
})
