import {Meteor} from 'meteor/meteor'
import {Match} from 'meteor/check'
import {Roles} from 'meteor/alanning:roles'

import {
    ROLES,
    SalesRecords,
    CreatedUsers,
    Quotes,
    Files,
    Events,
    SlackMessages,
    Projects,
    Tasks,
    NylasAccounts, Contacts, Threads, Messages, MailTemplates,SlackMails
} from '../models'

import {
    GET_PROJECTS,
    GET_USERS,
    GET_PROJECT,
    GET_SLACK_MSG,
    GET_PROJECT_EVENTS,
    GET_ADMIN_CREATE_USERS,
    GET_QUOTES,
    GET_PROJECT_FILES,
    GET_NYLAS_ACCOUNTS,
    GET_NEW_PROJECTS,
    GET_NEW_PROJECT,
    GET_CONTACTS,
    GET_MY_CONTACTS,
    GET_MESSAGES,
    GET_THREADS,
    GET_ALL_USERS,
    GET_SLACK_MAILS
} from '../constants/collections'


import '/imports/api/models/companies/publications'
import '/imports/api/models/people/publications'
import '/imports/api/models/threads/publications'
import '/imports/api/models/messages/publications'
import '/imports/api/models/mailtemplates/publications'
import '/imports/api/models/conversations/publications'

Meteor.startup(() => {
    //

    Meteor.publish(GET_USERS, () => Meteor.users.find({}, {
            fields: {
                'services': 0
            }
        }))

    Meteor.publishComposite(GET_PROJECTS, () => ({
        find() {
          if (Roles.userIsInRole(this.userId, ROLES.ADMIN)) return SalesRecords.find()
          return SalesRecords.find({'members': this.userId})
        },
        children: [
          {
            find({ stakeholders }) {
              if (stakeholders) {
                const contactIds = stakeholders.map(({ contactId }) => contactId)
                return Contacts.find({ _id: { $in: contactIds } })
              }
            }

          }
        ]
      }))

    Meteor.publish(GET_QUOTES, (projectId) => {
        Match.test(projectId, String)

        return Quotes.find({projectId})
    })

    Meteor.publish(GET_PROJECT, function (_id) {
        Match.test(_id, String)

        if (Roles.userIsInRole(this.userId, ROLES.ADMIN)) return SalesRecords.find({_id})
        return SalesRecords.find({_id, 'members': this.userId})
    })

    Meteor.publish(GET_ALL_USERS, function () {
      if (Roles.userIsInRole(this.userId, ROLES.ADMIN)) {
          // SUPERADMIN: can see any user
          return Meteor.users.find({}, {
            services: 0,
          })
      }
      if (Roles.userIsInRole(this.userId, ROLES.ADMIN)) {
          // ADMIN: see role <= ADMIN
          return Meteor.users.find({ roles: { $nin: ROLES.ADMIN} }, {
            services: 0,
          })
      }
    })

    Meteor.publish(GET_PROJECT_FILES, (projectId) => {
        Match.test(projectId, String)

        return Files.find({'metadata.projectId': projectId})
    })

    Meteor.publish(GET_PROJECT_EVENTS, (projectId) => {
        Match.test(projectId, String)

        return Events.find({projectId})
    })

    Meteor.publish(GET_SLACK_MSG, (salesRecordId) => {
        Match.test(salesRecordId, String)

        const salesRecord = SalesRecords.findOne(salesRecordId)
        if (salesRecord.slackChanel) {
            return SlackMessages.find({channel: salesRecord.slackChanel}, {sort: { createdAt: -1 }})
        } else {
            return []
        }
    })

    Meteor.publish(GET_NYLAS_ACCOUNTS, () => NylasAccounts.find({}))

    Meteor.publish(GET_CONTACTS, () => Contacts.find())

    Meteor.publish(GET_MY_CONTACTS, function () {
        if(!this.userId) return []
        const nylasAccounts = Meteor.users.findOne({_id:this.userId}).nylasAccounts()

        return Contacts.find({
            $or: [{
                account_id: {
                    $in:_.pluck(nylasAccounts, 'accountId')
                }
            },{
                userId: this.userId
            }]
        })
    })

    Meteor.publish(GET_NEW_PROJECTS, function () {
        if (Roles.userIsInRole(this.userId, ROLES.ADMIN)) return Projects.find()
        return Projects.find({'members.userId': this.userId})
    })

    Meteor.publish(GET_NEW_PROJECT, function (_id) {
        if (!Match.test(_id, String)) return this.ready()
        if (Roles.userIsInRole(this.userId, ROLES.ADMIN)) return Projects.find({_id})
        return Projects.find({_id, 'members.userId': this.userId})
    })

    Meteor.publish(GET_MESSAGES, function (salesRecordId) {
        if (!Match.test(salesRecordId, String)) return this.ready()

        //const threads = Threads.find({salesRecordId}).fetch()

        //return Messages.find({thread_id:{$in:_.pluck(threads, 'id')}})
        return Messages.find()
    })

    Meteor.publish(GET_THREADS, (salesRecordId) =>
        //if (!Match.test(salesRecordId, String)) return this.ready();

        //return Threads.find({salesRecordId})
         Threads.find({}))



    Meteor.publish(GET_SLACK_MAILS, function () {
        if(!this.userId) {
            this.ready()
            return
        }
        return SlackMails.find({})
    })
})
