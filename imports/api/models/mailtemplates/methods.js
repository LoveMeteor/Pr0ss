import {Roles} from 'meteor/alanning:roles'
import MailTemplates from './mailtemplates'
import {ROLES} from '../users/users'

Meteor.methods({
    insertTemplate(data)
    {
        check(data, {
            subject: String,
            body: String,
            isDefault: Match.Maybe(Boolean)
        })

        if(!Roles.userIsInRole(this.userId, [ROLES.ADMIN])) throw new Meteor.Error(401, 'No authorized')

        if(data.isDefault) {
            MailTemplates.update({}, {$set:{isDefault:false}}, {multi:true})
        } else {
            const templates = MailTemplates.find({isDefault:true}).fetch()
            if(templates.length == 0) data.isDefault = true
        }

        const _id = MailTemplates.insert(data)

        return MailTemplates.findOne({_id})
    },

    updateTemplate(_id, data)
    {
        check(_id, String)
        check(data, {
            subject: Match.Maybe(String),
            body: Match.Maybe(String),
            isDefault: Match.Maybe(Boolean)
        })

        if(!Roles.userIsInRole(this.userId, [ROLES.ADMIN])) throw new Meteor.Error(401, 'No authorized')

        const template = MailTemplates.findOne({_id})
        if(!template) throw new Meteor.Error(`Not found template with _id:${_id}`)

        if(data.isDefault) {
            MailTemplates.update({}, {$set:{isDefault:false}}, {multi:true})
        } else {
            const templates = MailTemplates.find({isDefault:true}).fetch()
            if(templates.length == 0) data.isDefault = true
        }

        MailTemplates.update({_id}, {$set:data})

        return MailTemplates.findOne({_id})
    },

    removeTemplate(_id)
    {
        check(_id, String)
        if(!Roles.userIsInRole(this.userId, [ROLES.ADMIN])) throw new Meteor.Error(401, 'No authorized')

        const template = MailTemplates.findOne({_id})
        if(!template) throw new Meteor.Error(`Not found template with _id:${_id}`)

        MailTemplates.remove({_id})

        if(template.isDefault) {
            MailTemplates.update({}, {$set:{isDefault:true}})
        }
    },

    setTemplateAsDefault(_id) {
        check(_id, String)

        const userId = this.userId

        if(!userId || !Roles.userIsInRole(userId, [ROLES.ADMIN])) throw new Meteor.Error(401, 'No authorized')

        const template = MailTemplates.findOne(_id)
        if(!template) throw new Meteor.Error(`Not found template with _id:${_id}`)

        MailTemplates.update({}, {$set:{isDefault:false}}, {multi:true})
        MailTemplates.update({_id}, {$set:{isDefault:true}})
    }
})