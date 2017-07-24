import React from 'react'
import { Meteor } from 'meteor/meteor'
import { compose } from 'react-komposer'
import { FlowRouter } from 'meteor/kadira:flow-router'
import getTrackerLoader from '../../traker'
import { Quotes, Files, Events, SlackMessages } from '/imports/api/models'
import {SalesRecords} from '/imports/api/models'
import { GET_PROJECT, GET_QUOTES, GET_PROJECT_FILES, GET_SLACK_MSG, GET_PROJECT_EVENTS, GET_MESSAGES } from '/imports/api/constants/collections'
import SingleProject from '/imports/ui/components/salesRecord/SingleSalesRecord'

const options = {
  loadingHandler: () => (<p className="page-loader"/>)
}

const reactiveMapper = (props, onData) => {
  const projectId = FlowRouter.getParam('id')
  if (
    Meteor.subscribe(GET_PROJECT_EVENTS, projectId).ready() &&
    Meteor.subscribe(GET_PROJECT, projectId).ready() &&
    Meteor.subscribe(GET_QUOTES, projectId).ready() &&
    Meteor.subscribe(GET_PROJECT_FILES, projectId).ready() &&
    Meteor.subscribe(GET_SLACK_MSG, projectId).ready() &&
    Meteor.subscribe(GET_MESSAGES, projectId).ready()
  ) {
    const files = {}
    Files
      .find({})
      .fetch()
      .forEach(item => files[item._id] = item)
    const msg = SlackMessages.find({}, {sort: {createAt: -1}}).fetch().map( item => {
      item.userId && (item.author = props.usersArr[item.userId])
      return item
    })

    const salesRecord = SalesRecords.findOne(projectId)
    if(salesRecord) {
      salesRecord.members = salesRecord.members.map(member => {
        member.user = props.usersArr[member]
        return member
      })
    }

    const quotes = Quotes.find({}, {sort: {createAt: -1}}).fetch()

    const events = Events.find().fetch().map(item => {
      item.type = 'event'
      item.author = props.usersArr[item.createBy]
      return item
    })
    const messages = msg.concat(events).sort((a,b) => a.createAt > b.createAt ? -1 : 1)
    onData(null, { messages, salesRecord, quotes})
  }
}

export default compose(
  getTrackerLoader(reactiveMapper),
  options
)(SingleProject)

