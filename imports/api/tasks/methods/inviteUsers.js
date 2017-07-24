import { ValidatedMethod } from 'meteor/mdg:validated-method'
import SimpleSchema from 'simpl-schema'
import { Projects, SalesRecords } from '../../models'

export default new ValidatedMethod({
  name: 'task.inviteUsers',
  validate: new SimpleSchema({
    parentId: {
      type: String,
    },
    taskOperators: {
      type: Array,
    },
    'taskOperators.$': {
      type: String,
    },
  }).validator(),
  run({ parentId, taskOperators }) {
    /*
    * Add employee and approver to current project
    * */
    const project = Projects.findOne(parentId)
    const salesRecord = SalesRecords.findOne(parentId)
    const taskParent = project || salesRecord
    if (taskParent) {
      const { members = [] } = taskParent
      const memberIds = members.map(({ userId }) => userId)

      // Invite assigned users to project/saleRecord
      const willInviteUserIds = taskOperators
        .filter(userId => !memberIds.includes(userId) && !!userId)
        .map(userId => ({ userId, isAdmin: false, category: [] }))

      // Invite user to project
      if (project) {
        Projects.update(parentId, {
          $push: {
            members: {
              $each: willInviteUserIds,
            },
          },
        })
      };

      // Invite user to saleRecord
      if (salesRecord) {
        SalesRecords.update(parentId, {
          $push: {
            members: {
              $each: willInviteUserIds,
            },
          },
        })
      }

      /*
       * TODO: Invite to slack channel
       * */
    };
  },
})
