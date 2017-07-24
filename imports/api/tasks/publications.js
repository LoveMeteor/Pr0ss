import  moment from 'moment'
import { Tasks } from '../models'

Meteor.publishComposite('task.all', function (param) {
  if (!Match.test(param, {
    parentId: String,
    filter: {
      AssignToMe: Boolean,
      DueDate: Boolean,
      IamApprover: Boolean,
      Today: Boolean,
      Tomorrow: Boolean,
    },
  })) return this.ready()

  if (!this.userId) return this.ready()
  const {
    parentId,
    filter: {
      AssignToMe,
      DueDate,
      IamApprover,
      Today,
      Tomorrow,
    },
  } = param

  const selector = {
    parentId,
    isRemoved: false,
  }

  if (AssignToMe) selector.assignee = this.userId
  if (IamApprover) selector.approver = this.userId
  if (DueDate) selector.dueDate = { $lt: new Date() }
  if (Today) {
    const start = moment(`${moment().format('YYYY-MM-DD')} 00:00:00`).toDate()
    const end = moment(`${moment().format('YYYY-MM-DD')} 23:59:59`).toDate()
    selector.dueDate = { $gte: start, $lte: end }
  }

  if (Tomorrow) {
    const start = moment(`${moment().add(1, 'd').format('YYYY-MM-DD')} 00:00:00`).toDate()
    const end = moment(`${moment().add(1, 'd').format('YYYY-MM-DD')} 23:59:59`).toDate()
    selector.dueDate = { $gte: start, $lte: end }
  }

  return {
    find() {
      return Tasks.find(selector, {
        fields: {
          isRemoved: 0,
          comments: 0,
        },
      })
    },

    children: [
      {
        find({ assignee, approver }) {
          return Meteor.users.find({ _id: { $in: [assignee, approver] } })
        },
      },
    ],
  }
})

/*
* publish detail of a task
* */

Meteor.publishComposite('task.details', function({ _id }) {
  if (!Match.test(_id, String)) return this.ready()
  return {
    find() {
      return Tasks.find({
        _id,
        isRemoved: false,
      }, {
        fields: {
          isRemoved: 0,
        },
      })
    },
    children: [
      {
        find({ comments }) {
          if (comments) {
            const userIds = comments.map(({ userId }) => userId)
            return Meteor.users.find({ _id: { $in: userIds } })
          }
        },
      },
    ],
  }
})

/*
* publish tasks by userId
* */

Meteor.publishComposite('task.byUserId', function() {
  const userId = this.userId
  if (!userId) return this.ready()
  return {
    find() {
      return Tasks.find({
        isRemoved: false,
        $or: [{assignee: userId}, {approver: userId}]
      }, {
        fields: {
          isRemoved: 0,
        },
      })
    },
  }
})
