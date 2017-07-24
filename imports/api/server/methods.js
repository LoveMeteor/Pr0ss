import _ from 'underscore'
import {Meteor} from 'meteor/meteor'
import {Roles} from 'meteor/alanning:roles'
import {check, Match} from 'meteor/check'
import {
    Files,
    Quotes,
    Settings,
} from '../models'
import {SlackMails, SalesRecords, ROLES, Threads, NylasAccounts} from '../models'

import {prossDocDrive} from '../drive'
import {getUserEmail} from '/imports/api/lib/filters'

import '../lib/extendMatch.js'
import google from 'googleapis'
import config from '../config'
import '../models/nylasaccounts/methods'
import '../models/companies/methods'
import '../models/contacts/methods'
import '../models/salesRecords/methods'
import '../models/mailtemplates/methods'
import '../models/messages/methods'
import '../models/threads/methods'
import '../models/slackmails/methods'
import '../models/people/methods'
import '../models/conversations/methods'
import {googleServerApiAutToken} from '../../api/server/functions'

const driveScopes = [
    'https://www.googleapis.com/auth/drive',
    'https://www.googleapis.com/auth/drive.file',
    'https://www.googleapis.com/auth/drive.appdata',
    'https://www.googleapis.com/auth/drive.apps.readonly'
]
//googleServerApiAutToken is async but we need token to make req to google drive api
const syncGoogleServerApiAutToken = Meteor.wrapAsync(googleServerApiAutToken)
const googleToken = syncGoogleServerApiAutToken(driveScopes)

const OAuth2Client = google.auth.OAuth2
const oauth2Client = new OAuth2Client(
    config.google.clientDriveId,
    config.google.clientDriveSecret,
    config.google.redirectUri)

oauth2Client.setCredentials({
    access_token: googleToken
})

const googleDrive = google.drive({version: 'v3', auth: oauth2Client})

Meteor.methods({
    userRegistration(userData){
        check(userData, {
            username: String,
            email: String,
            password: String,
            firstName: String,
            lastName: String,
            googleRefreshToken: Match.Maybe(String)
        })

        const {username, email, password, firstName, lastName, googleRefreshToken} = userData
        const validation = {}
        if (Accounts.findUserByUsername(username)) validation.username = `Username "${username}" is already exist`
        if (Accounts.findUserByEmail(email)) validation.email = `Email "${email}" is already exist`

        if (!_.isEmpty(validation)) {
            userData.validation = validation
            return userData
        }
        const userId = Accounts.createUser({
            username,
            email,
            password,
            profile: {
                firstName,
                lastName,
                role: [
                    {role: ROLES.SALES}
                ],
            },
        })
        Roles.addUsersToRoles(userId, [ROLES.SALES])

        userData.validation = validation

        if (userId) {
            Meteor.call('initVisiableFields', userId)
            Meteor.users.update({_id: userId}, {$set: {status: 'pending'}})
        }

        return userData
    },

    initVisiableFields(userId) {
        const salesRecord = Settings.findOne({key: 'salesRecord', userId})
        const newProject = Settings.findOne({key: 'newProject', userId})
        if (!salesRecord) {
            Settings.insert({
                key: 'salesRecord',
                userId,
                show: [
                    'name',
                    'productionStartDate',
                    'actualDeliveryDate',
                    'shippingMode',
                ]
            })
        }
        if (!newProject) {
            Settings.insert({
                userId,
                key: 'newProject',
                show: [
                    '_id',
                    'name',
                ]
            })
        }
    },

    getVisibleFields(key) {
        check(key, String)
        const userId = this.userId
        const setting = Settings.findOne({key, userId})
        if (!setting) {
            Meteor.call('initVisiableFields', userId)
            return Settings.findOne({key, userId}).show
        } else

            return setting.show
    },

    updateVisibleFields(key, visibleFields) {
        if (!this.userId) return
        check(visibleFields, [String])
        check(key, String)
        const userId = this.userId
        Settings.update({key, userId}, {
            $set: {
                show: visibleFields,
            }
        })
    },

    updateProjectProperty(salesRecordId, property) {
        check(salesRecordId, String)
        check(property, {
            key: String,
            value: Match.OneOf(String, Date)
        })
        const {key, value} = property

        // current user belongs to ADMIN LIST
        const isAdmin = Roles.userIsInRole(this.userId, [ROLES.ADMIN])

        // current user belongs to salesRecords
        const salesRecord = SalesRecords.findOne(salesRecordId)
        if (!salesRecord) throw new Meteor.Error('Project does not exists')
        const isMember = !!salesRecord.members.find(userId => userId === this.userId)

        // check permission
        if (!isMember && !isAdmin) throw new Meteor.Error('Access denied')

        return SalesRecords.update(salesRecordId, {
            $set: {
                [key]: value,
            }
        })
    },

    sendEmail(mailData) {
        Match.test(mailData, {
            to: Match.OneOf(String, [String]),
            from: String,
            replyTo: String,
            subject: String,
            attachments: Match.Maybe([String]),
            html: String,
        })
        this.unblock()

        if (_.isArray(mailData.attachments) && mailData.attachments.length) {
            mailData.attachments = Files.find({_id: {$in: mailData.attachments}}).fetch().map(item => ({
                fileName: item.original.name,
                filePath: `${Meteor.absoluteUrl(`cfs/files/files/${item._id}/${item.original.name}`)}`
            }))
        }

        Email.send(mailData)
        return 'Message is sending'
    },

    adminCreateUser(user) {
        check(user, {
            firstName: String,
            lastName: String,
            username: String,
            email: Match.Where((str) => {
                check(str, String)
                const regexp = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
                return regexp.test(str)
            }),
            role: Match.Where((str) => (Object.values(ROLES).includes(str)))
        })
        if (!Roles.userIsInRole(this.userId, [ROLES.ADMIN])) throw new Meteor.Error('Access denied')
        const {email, username, firstName, lastName, role} = user
        if (Accounts.findUserByEmail(email))
            throw new Meteor.Error('validEmail', `Email "${email}" is already exist`)
        if (Accounts.findUserByUsername(username))
            throw new Meteor.Error('validUsername', `"${username}" is already exist`)

        // create a random password
        const password = Math.random().toString(36).substr(7)
        const createdUserId = Accounts.createUser({
            username,
            email,
            password,
            profile: {
                firstName,
                lastName,
            },
        })

        Meteor.users.update(createdUserId, {
            $set: {
                createdBy: this.userId,
                roles: [role],
                status: 'active'
            }
        })

        if (createdUserId) Meteor.call('initVisiableFields', createdUserId)

        // Meteor.defer(() => Accounts.sendEnrollmentEmail(createdUserId))
        Meteor.defer(() => {
            Meteor.call('sendEmail', {
                to: email,
                from: 'Prossimo Service',
                replyTo: 'noreply@gmail.com',
                subject: '[Prossimo] Active user',
                html: `<div>
        <p>Your account is active </p>
        <p>Account information: </p>
        <ul>
          <li> Email: ${email}</li>
          <li> Password: ${password}</li>
        </ul>
        <p> Please change to new password after you access application<p>
       <div>`,
            })
        })
        return createdUserId
    },

    adminEditUser(userId, userFields){
        console.log('userFields', userFields)
        check(userId, String)
        check(userFields, {
            firstName: String,
            lastName: String,
            role: String,
            status: Match.Maybe(String)
        })

        if (!Roles.userIsInRole(this.userId, [ROLES.ADMIN])) throw new Meteor.Error('Access denied')
        if (Roles.userIsInRole(this.userId), role === ROLES.ADMIN) throw new Meteor.Error('Can not set current user as super admin')
        const {firstName, lastName, role, status} = userFields
        const user = Meteor.users.findOne({_id: userId}, {fields: {status: 1, emails: 1}})

        Meteor.users.update(userId, {
            $set: {
                'profile.firstName': firstName,
                'profile.lastName': lastName,
                'roles.0': role,
                status
            }
        })
        if (user.status === 'pending' && status === 'active') {
            Meteor.call('inviteUserToSlack', getUserEmail(user))
            Meteor.defer(() => {
                Meteor.call('sendEmail', {
                    to: user.emails[0].address,
                    from: 'Prossimo Service',
                    replyTo: 'noreply@gmail.com',
                    subject: '[Prossimo] Active user',
                    html: `<div>
          <p>Your account is active, now </p>
         <div>`,
                })
            })
        }
    },

    adminRemoveUser(userIds) {
        check(userIds, [String])
        if (!Roles.userIsInRole(this.userId, [ROLES.ADMIN])) throw new Meteor.Error('Access denied')
        // can not remove super admin role
        const removeIds = userIds.filter((userId) => !Roles.userIsInRole(userId, [ROLES.ADMIN]))
        Meteor.users.remove({_id: {$in: removeIds}})
        if (removeIds.length != userIds.length) {
            throw new Meteor.Error('Can not remove super admin account')
        }
    },

    updateProjectShipping(salesRecordId, shipping) {
        check(salesRecordId, String)
        check(shipping, {
            shippingContactPhone: Match.Maybe(Match.phone),
            shippingContactName: Match.Maybe(String),
            shippingContactEmail: Match.Maybe(String),
            shippingAddress: Match.Maybe(String),
            shippingNotes: Match.Maybe(String),
        })
        // current user belongs to ADMIN LIST
        const isAdmin = Roles.userIsInRole(this.userId, [ROLES.ADMIN])

        // current user belongs to salesRecords
        const salesRecord = SalesRecords.findOne(salesRecordId)
        if (!salesRecord) throw new Meteor.Error('Project does not exists')
        const isMember = !!salesRecord.members.find(userId => userId === this.userId)

        // check permission
        if (!isMember && !isAdmin) throw new Meteor.Error('Access denied')
        shipping.modifiedAt = new Date()
        return SalesRecords.update(salesRecordId, {
            $set: shipping,
        })
    },

    updateProjectBilling(salesRecordId, billing) {
        check(salesRecordId, String)
        check(billing, {
            billingContactPhone: Match.Maybe(Match.phone),
            billingContactName: Match.Maybe(String),
            billingContactEmail: Match.Maybe(String),
            billingAddress: Match.Maybe(String),
            billingNotes: Match.Maybe(String),
        })
        // current user belongs to ADMIN LIST
        const isAdmin = Roles.userIsInRole(this.userId, [ROLES.ADMIN])

        // current user belongs to salesRecords
        const salesRecord = SalesRecords.findOne(salesRecordId)
        if (!salesRecord) throw new Meteor.Error('Project does not exists')
        const isMember = !!salesRecord.members.find(userId => userId === this.userId)

        // check permission
        if (!isMember && !isAdmin) throw new Meteor.Error('Access denied')
        billing.modifiedAt = new Date()
        return SalesRecords.update(salesRecordId, {
            $set: billing,
        })
    },

    updateProjectAttributes(salesRecordId, attributes) {
        check(salesRecordId, String)
        check(attributes, {
            shippingMode: String,
            actualDeliveryDate: Date,
            productionStartDate: Date,
            estDeliveryRange: [Date],
            supplier: Match.Maybe(String),
            shipper: Match.Maybe(String),
            estProductionTime: Match.Maybe(Number),
            actProductionTime: Match.Maybe(Number),
        })

        // current user belongs to ADMIN LIST
        const isAdmin = Roles.userIsInRole(this.userId, [ROLES.ADMIN])

        // current user belongs to salesRecords
        const salesRecord = SalesRecords.findOne(salesRecordId)
        if (!salesRecord) throw new Meteor.Error('Project does not exists')
        const isMember = !!salesRecord.members.find(userId => userId === this.userId)

        // check permission
        if (!isMember && !isAdmin) throw new Meteor.Error('Access denied')
        attributes.modifiedAt = new Date()
        return SalesRecords.update(salesRecordId, {
            $set: attributes,
        })
    },

    addMemberToProject(salesRecordId, member){
        check(salesRecordId, String)
        check(member, {
            userId: String,
            isMainStakeholder: Boolean,
            category: Match.OneOf([String], [])
        })

        if (!Roles.userIsInRole(this.userId, [ROLES.ADMIN])) throw new Meteor.Error('Access denied')

        SalesRecords.update(salesRecordId, {$push: {members: member}})
        // allow edit folder
        const user = Meteor.users.findOne(member.userId)
        if (user && user.emails && user.emails.length > 0) {
            const email = user.emails[0].address
            if (email) {
                const salesRecord = SalesRecords.findOne(salesRecordId)
                if (salesRecord && salesRecord.folderId) {
                    prossDocDrive.shareWith.call({fileId: salesRecord.folderId, email})
                }
            }
        }
    },

    updateUserInfo(user){
        if (user.userId !== this.userId && !Roles.userIsInRole(this.userId, [ROLES.ADMIN]))
            throw new Meteor.Error('Access denied')

        Meteor.users.update({_id: user.userId}, {
            $set: {
                username: user.username,
                'profile.firstName': user.firstName,
                'profile.lastName': user.lastName,
                'profile.twitter': user.twitter,
                'profile.facebook': user.facebook,
                'profile.linkedIn': user.linkedIn,
                'profile.companyName': user.companyName,
                'profile.companyPosition': user.companyPosition
            }
        })
    },


    updateUserProfileField(field, data){
        check(field, String)
        check(data, Match.OneOf(String, Number))

        if (!this.userId) {
            throw new Meteor.Error('No authorized')
        }
        Meteor.users.update({_id: this.userId}, {
            $set: {
                [`profile.${field}`]: data
            }
        })
    },

    addNewQuote(data){
        if (!Roles.userIsInRole(this.userId, [ROLES.ADMIN, ROLES.SALES])) {
            throw new Meteor.Error('Access denied')
        }

        data.createBy = this.userId

        Quotes.insert(data)
    },

    addQuoteRevision(data){
        check(data, {
            revisionNumber: Number,
            quoteId: String,
            totalPrice: Number,
            createBy: String,
            createAt: Date,
            fileName: String,
            fileId: String
        })
        if (!Roles.userIsInRole(this.userId, [ROLES.ADMIN, ROLES.SALES])) {
            throw new Meteor.Error('Access denied')
        }

        const quoteId = data.quoteId
        delete data.quoteId

        Quotes.update(quoteId, {
            $push: {
                revisions: data
            }
        })
    },

    updateQuoteRevision(data){
        check(data, {
            revisionNumber: Number,
            quoteId: String,
            totalPrice: Number,
            updateBy: String,
            updateAt: Date,
            fileName: String,
            fileId: String
        })
        if (!Roles.userIsInRole(this.userId, [ROLES.ADMIN, ROLES.SALES])) {
            throw new Meteor.Error('Access denied')
        }
        let oldFileId

        const quote = Quotes.findOne(data.quoteId)

        const revisions = quote.revisions.map(revision => {
            if (revision.revisionNumber === data.revisionNumber) {
                oldFileId = revision.fileId

                revision.totalPrice = data.totalPrice
                revision.updateBy = data.updateBy
                revision.updateAt = data.updateAt
                revision.fileName = data.fileName
                revision.fileId = data.fileId
            }
            return revision
        })

        Quotes.update(quote._id, {$set: {revisions}})
        Files.remove(oldFileId)
    },

    editQuoteName(quoteId, name){
        check(quoteId, String)
        check(name, String)
        if (!Roles.userIsInRole(this.userId, [ROLES.ADMIN, ROLES.SALES])) {
            throw new Meteor.Error('Access denied')
        }

        Quotes.update({_id: quoteId}, {
            $set: {name}
        })
    },

    updateUserConversationGroups(group, membersId){
        check(group, String)
        check(membersId, [String])

        const profile = Meteor.users.findOne({_id: this.userId}).profile
        if (profile.conversationGroups && profile.conversationGroups.length) {
            const updateGroups = profile.conversationGroups.map(item => {
                if (item.name === group) {
                    return {
                        name: group,
                        members: membersId
                    }
                } else {
                    return item
                }
            })
            Meteor.users.update({_id: this.userId}, {
                $set: {
                    'profile.conversationGroups': updateGroups
                }
            })
        } else {
            Meteor.users.update({_id: this.userId}, {
                $set: {
                    'profile.conversationGroups': [{
                        name: group,
                        members: membersId
                    }]
                }
            })
        }
    },

    getTwilioToken() {
        const twilio = require('twilio')
        const config = require('../config/config')

        const capability = new twilio.Capability(
            config.twilio.accountSid,
            config.twilio.authToken
        )
        capability.allowClientOutgoing(config.twilio.appSid)
        const token = capability.generate()

        return token
    },

    async getDriveFileList() {
        const drive = google.drive('v3')
        const driveScopes = [
            'https://www.googleapis.com/auth/drive',
            'https://www.googleapis.com/auth/drive.file',
            'https://www.googleapis.com/auth/drive.appdata',
            'https://www.googleapis.com/auth/drive.apps.readonly'
        ]

        const OAuth2Client = google.auth.OAuth2
        const oauth2Client = new OAuth2Client(
            config.google.clientDriveId,
            config.google.clientDriveSecret,
            config.google.redirectUri)

        //googleServerApiAutToken is async but we need token to make req to google drive api
        const syncGoogleServerApiAutToken = Meteor.wrapAsync(googleServerApiAutToken)
        const googleToken = syncGoogleServerApiAutToken(driveScopes)

        oauth2Client.setCredentials({
            access_token: googleToken
        })

        // Create the promise so we can use await later.
        const driveFileListPromise = new Promise((resolve, reject) => {
            googleDrive.files.list({
                auth: oauth2Client,
                pageSize: 10,
                fields: 'nextPageToken, files'
                // fields: "nextPageToken, files(id, name)"
            }, (err, response) => {
                if (err) {
                    return reject(err)
                }
                resolve(response)
            })
        })

        // return promise result to React method
        try {
            return await driveFileListPromise
        } catch (err) {
            console.log(`ERROR: ${err.message}`)
            throw err
        }
    },

    async saveGoogleDriveFile(fileInfo, fileData) {
        // Create the promise so we can use await later.
        const driveFileListPromise = new Promise((resolve, reject) => {
            googleDrive.files.create({
                resource: {
                    name: fileInfo.name,
                    mimeType: fileInfo.type
                },
                media: {
                    mimeType: fileInfo.type,
                    body: fileData
                }
            }, (err, response) => {
                if (err) {
                    return reject(err)
                }
                resolve(response)
            })
        })

        // return promise result to React method
        try {
            return await driveFileListPromise
        } catch (err) {
            console.log(`ERROR: ${err.message}`)
            throw err
        }
    }
})
