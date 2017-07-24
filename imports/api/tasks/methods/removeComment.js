import { ValidatedMethod } from 'meteor/mdg:validated-method'
import SimpleSchema from 'simpl-schema'
import { Tasks } from '../../models'

export default new ValidatedMethod({
  name: 'task.removeComment',
  validate: new SimpleSchema({
    _id: {
      type: String,
    },
  }).validator(),
  run({ _id }) {
    if (!this.userId) throw new Error('User is not allowed to add comment')
    const task = Tasks.findOne({
      'comments._id': _id,
      'comments.userId': this.userId,
    })

    const getChilds = (comments, _id, path) => {
      // GET CHILD ELEM
      const childs = comments.filter(({ parentId }) => parentId === _id)

      // SAVE RESULT
      childs.forEach(({ _id }) => path.push(_id))
      while (childs.length) {

        // GET CHILD OF CHILD
        const child = childs.shift()
        getChilds(comments, child._id, path)
      }
    }

    if (task) {
      const removeIds = [_id]
      getChilds(task.comments, _id, removeIds)
      Tasks.update({}, {
        $pull: {
          comments: {
            _id: { $in: removeIds },
          },
        },
      }, { multi: true })
    }
  },
})
