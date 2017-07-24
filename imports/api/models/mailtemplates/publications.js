import MailTemplates from './mailtemplates'
import {GET_MAILTEMPLATES} from '../../constants/collections'

Meteor.publish(GET_MAILTEMPLATES, function () {
    if(!this.userId) return this.ready()

    return MailTemplates.find()
})