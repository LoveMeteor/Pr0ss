import { Meteor } from 'meteor/meteor'
import {Roles} from 'meteor/alanning:roles'
import { ValidatedMethod } from 'meteor/mdg:validated-method'
import SimpleSchema from 'simpl-schema'
import Messages from './messages'
import NylasAPI from '../../nylas/nylas-api'
import Threads from '../threads/threads'
import {insertThread, updateThread} from '../threads/methods'

const bound = Meteor.bindEnvironment((callback) => callback())


export const insertMessage = new ValidatedMethod({
    name: 'message.insert',
    validate: Messages.schema.omit('_id', 'created_at', 'modified_at').validator({clean: true}),
    run(message) {
        if (!this.userId) throw new Meteor.Error(403, 'Not authorized')

        Messages.insert(message)

        return true
    }
})

export const updateMessage = new ValidatedMethod({
    name: 'message.update',
    validate: Messages.schema.validator({clean:true}),
    run({_id, ...data}) {
        if(!this.userId) throw new Meteor.Error(403, 'Not authorized')

        const message = Messages.findOne(_id)
        if(!message) throw new Meteor.Error(`Could not found message with _id:${_id}` )

        Messages.update({_id}, {$set:data})
    }
})

export const insertMessageForSalesRecord = new ValidatedMethod({
    name: 'message.insertForSalesRecord',
    validate: new SimpleSchema({
        salesRecordId:{type:String, optional:true},
        conversationId:{type:String, optional:true},
        message: Messages.schema.omit('_id','created_at','modified_at')
    }).validator({clean:true}),
    run({salesRecordId, conversationId, message}) {
        if(!this.userId) throw new Meteor.Error(403, 'Not authorized')

        if(!salesRecordId && !conversationId) throw new Meteor.Error('SalesRecordId or conversationId should be provided')
        NylasAPI.makeRequest({
            path: `/threads/${message.thread_id}`,
            method: 'GET',
            accountId: message.account_id
        }).then((thread) => {
            if (thread) {
                bound(() => {
                    if(Meteor.isServer) {
                        const existingThread = Threads.findOne({id:thread.id})
                        if(existingThread) {
                            Threads.update({id:thread.id}, {$set:thread})
                        } else {
                            Threads.insert(_.extend(thread, {salesRecordId, conversationId}))
                        }

                        Messages.insert(message)
                    }
                })
            }
        })
    }
})