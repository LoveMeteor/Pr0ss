import React from 'react'
import classNames from 'classnames'
import { createContainer  } from 'meteor/react-meteor-data'
import Alert from 'react-s-alert'
import BlockUi from 'react-block-ui'
import { Loader, Types } from 'react-loaders'
import 'loaders.css/loaders.min.css'
import 'react-block-ui/style.css'
import Header from './components/header/Header'
import Aside from './components/aside/Aside'
import Spinner from './components/utils/spinner'
import {SalesRecords} from '/imports/api/models'
import {
    GET_USERS,
    GET_PROJECTS,
    GET_MY_CONTACTS,
    GET_NYLAS_ACCOUNTS,
    GET_MAILTEMPLATES,
    GET_THREADS,
    GET_SLACK_MAILS,
    GET_COMPANIES,
    GET_COMPANY_TYPES,
    GET_PEOPLE,
    GET_PEOPLE_DESIGNATIONS
} from '/imports/api/constants/collections'
class App extends React.Component{
    constructor(props){
        super(props)
        this.toggleLoader =  this.toggleLoader.bind(this)
        this.state = {
          blocking: false
        }
    }

    renderAside(){
        const { currentUser } = this.props
        if(!currentUser) return null

        return <Aside key="main-control-aside"
                      salesRecords={this.props.salesRecords}
                      currentUser={currentUser}/>

    }

    toggleLoader(blocking) {
      //disable scroller
      if(blocking === true) {
        $('.app').attr('style', 'overflow: hidden')
      } else {
          $('.app').attr('style', 'overflow: scroll')
      }
      this.setState({blocking})
    }

    render() {
        const { loading, currentUser } = this.props
        if(loading) return <Spinner visible={true}/>

        return (
            <BlockUi className="app" tag="div" loader={<Loader active type="line-spin-fade-loader" color="#5b8bff"/>} blocking={this.state.blocking}>
                <Header user={currentUser} />
                  {this.renderAside()}
                  <div className="page-content active-aside">
                      {React.cloneElement(this.props.content, {...this.props, toggleLoader: this.toggleLoader})}
                  </div>
                <Alert stack={{limit: 3}}/>
            </BlockUi>

        )
    }
}

export default createContainer(() => {
    const subscribers = []
    subscribers.push(Meteor.subscribe(GET_USERS))
    subscribers.push(Meteor.subscribe(GET_NYLAS_ACCOUNTS))
    subscribers.push(Meteor.subscribe(GET_MY_CONTACTS))
    subscribers.push(Meteor.subscribe(GET_MAILTEMPLATES))
    subscribers.push(Meteor.subscribe(GET_THREADS))
    subscribers.push(Meteor.subscribe(GET_SLACK_MAILS))
    subscribers.push(Meteor.subscribe(GET_COMPANIES))
    subscribers.push(Meteor.subscribe(GET_COMPANY_TYPES))
    subscribers.push(Meteor.subscribe(GET_PEOPLE))
    subscribers.push(Meteor.subscribe(GET_PEOPLE_DESIGNATIONS))
    subscribers.push(Meteor.subscribe(GET_PROJECTS))
    subscribers.push(Meteor.subscribe('MyThreads'))
    subscribers.push(Meteor.subscribe('MyMessages'))
    subscribers.push(Meteor.subscribe('Conversations'))

    const currentUser = Meteor.users.findOne(Meteor.userId())
    const salesRecords = SalesRecords.find({}, {sort: {createAt: -1}}).fetch()
    const users = Meteor.users.find({}, {
        sort: [
            ['profile.firstName', 'asc'],
        ]
    }).fetch()
    const usersArr = {}
    users.forEach(item => {
        usersArr[item._id] = item
    })

    return {
        loading: !subscribers.reduce((prev, subscriber) => prev && subscriber.ready(), true),
        currentUser, users, usersArr, salesRecords
    }
}, App)
