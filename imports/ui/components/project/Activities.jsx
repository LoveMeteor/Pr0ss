import React, { Component } from 'react'
import moment from 'moment'
import { createContainer } from 'meteor/react-meteor-data'
import { GET_NEW_PROJECT } from '/imports/api/constants/collections'
import SlackMessages from '/imports/api/models/slackMessages/slackMessages'
import Projects from '/imports/api/models/projects/projects'
import Message from '../salesRecord/Massage.jsx'
import { getUserName } from '../../../api/lib/filters'

class Activities extends Component {
  constructor(props) {
    super(props)
  }

  componentWillUnmout() {
    this.props.subscribers.forEach(sub => sub.stop())
  }

  getMassageList() {
    if (!this.props.messages.length) {
      return (
        <div className='massage-list'>
          <p>No Activity yet</p>
        </div>
      )
    };

    const activityList = this.props.messages.map(item => {
      switch (item.type) {
        case 'message': {
          return <Message key={item._id}  message={item}/>
        }

        case 'event': {
          return (
            <li key={item._id}
              className='event-message'>
              { getUserName(item.author, true) }
              { item.name } at
              { moment(item.createAt).format('h:mm, MMMM Do YYYY') }
            </li>
          )
        };

        default:
          return null
      }
    })

    return (
      <div className='massage-list'>
        <ul>
          { activityList }
        </ul>
      </div>
    )
  }

  render() {
    return (
      <div className='activity'>
        {this.getMassageList()}
      </div>
    )
  }
}

export default createContainer(props => {
  const { projectId } = props
  const subscribers = []
  subscribers.push(Meteor.subscribe(GET_NEW_PROJECT, projectId))
  subscribers.push(Meteor.subscribe('project.slackMessages', projectId))
  const { slackChanel } = Projects.findOne(projectId)
  return {
    messages: SlackMessages.find({ channel: slackChanel }, { sort: { createAt: -1 } }).fetch(),
    subscribers,
  }
}, Activities)
