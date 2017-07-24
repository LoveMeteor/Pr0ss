import {Roles} from 'meteor/alanning:roles'
import React, { Component } from 'react'
import EditableUsersTable  from '../components/admin/EditableUsersTable'
import { createContainer  } from 'meteor/react-meteor-data'
import { GET_ALL_USERS } from '/imports/api/constants/collections'
import {ROLES} from '/imports/api/models'

class AdminPage extends Component{
  constructor(props){
    super(props)
  }

  componentWillUnmount() {
    this.props.subscribers.forEach((subscriber) => subscriber.stop())
  }

  render() {
    if (Roles.userIsInRole(Meteor.userId(), ROLES.ADMIN)) {
      return (
        <div className="page-container admin-page">
          <div className="main-content">
            <div className="tab-container">
              <h2 className="page-title">Admin page</h2>
              <EditableUsersTable createdUsers={this.props.users}/>
            </div>
          </div>
        </div>
      )
    } else {
      return (
        <div className='text-center'>Access Denied</div>
      )
    }
  }
}

export default createContainer(() => {
  const subscribers = []
  let users = []
  subscribers.push(Meteor.subscribe(GET_ALL_USERS))

  if (Roles.userIsInRole(Meteor.userId(), ROLES.ADMIN)) {
    users = Meteor.users.find({username: { $ne: 'root' }}).fetch()
  }
  return {
    subscribers,
    loading: !subscribers.reduce((prev, subscriber) => prev && subscriber.ready(), true),
    users,
  }
}, AdminPage)
