import React from 'react'
import {mount} from 'react-mounter'
import {FlowRouter} from 'meteor/kadira:flow-router'

import App from '/imports/ui/App'
import SingleSalesRecord from '../../api/composer/componencts/project/SingleProject'
import SingleProjectPage from '/imports/ui/components/project/SingleProject'
import DriveSettingsPage from '/imports/ui/pages/DriveSettingsPage'

import {AuthenticationPage, SalesRecordPage, UserAccount, InboxPage, InboxSettingsPage, ContactsPage, CompaniesPage, FinancialPage, ProjectsPage, AdminPage, DashboardPage, PeoplePage} from '/imports/ui/pages'

function checkAuth() {
    if(!Meteor.userId()) FlowRouter.go('Root')
}

FlowRouter.route('/', {
    name: 'Root',
    action(){
        if(Meteor.userId()){
            mount(App, {
                content: <ProjectsPage/>,
            })
        }else{
            mount(App, {
                content: <AuthenticationPage/>,
            })
        }
    }
})

FlowRouter.route('/dashboard', {
    name: 'Dashboard',
    action(){
        checkAuth()
        mount(App, {
            //todo create Dashboard page component
            content: <DashboardPage/>,
        })
    }
})

FlowRouter.route('/account', {
    name: 'Account',
    action(){
        checkAuth()
        mount(App, {
            content: <UserAccount/>,
        })
    }
})

FlowRouter.route('/inbox', {
    name: 'Inbox',
    action(){
        checkAuth()
        mount(App, {
            content: <InboxPage/>,
        })
    }
})

FlowRouter.route('/inbox_settings', {
    name: 'InboxSettings',
    action(){
        checkAuth()
        mount(App, {
            content: <InboxSettingsPage/>,
        })
    }
})

FlowRouter.route('/projects', {
    name: 'Projects',
    action() {
        checkAuth()
        mount(App, {
            content: <ProjectsPage/>
        })
    }
})

FlowRouter.route('/project/:id', {
    name: 'Project',
    action() {
        checkAuth()
        mount(App, {
            content: <SingleProjectPage/>
        })
    }
})

FlowRouter.route('/salesrecord/:id', {
    name: 'SalesRecord',
    action(){
        checkAuth()
        mount(App, {
            content: <SingleSalesRecord/>,
        })
    }
})
FlowRouter.route('/deals', {
    name: 'Deals',
    action(){
      checkAuth()
      mount(App, {
            content: <SalesRecordPage />
      })
    }
})
FlowRouter.route('/leads', {
    name: 'Leads',
    action(){
        checkAuth()
        mount(App, {
            content: <SalesRecordPage stage="lead"/>,
        })
    }
})

FlowRouter.route('/opportunities', {
    name: 'Opportunities',
    action() {
        checkAuth()
        mount(App, {
            content: <SalesRecordPage stage="opportunity"/>,
        })
    }
})

FlowRouter.route('/orders', {
    name: 'Orders',
    action(){
        checkAuth()
        mount(App, {
            content: <SalesRecordPage stage="order"/>,
        })
    }
})

FlowRouter.route('/tickets', {
    name: 'Tickets',
    action(){
        checkAuth()
        mount(App, {
            content: <SalesRecordPage stage="ticket"/>,
        })
    }
})

FlowRouter.route('/contacts', {
    name: 'Contacts',
    action(){
        checkAuth()
        mount(App, {
            content: <ContactsPage/>,
        })
    }
})

FlowRouter.route('/people', {
    name: 'People',
    action(){
        checkAuth()
        mount(App, {
            content: <PeoplePage/>,
        })
    }
})

FlowRouter.route('/companies', {
    name: 'Companies',
    action(){
        checkAuth()
        mount(App, {
            content: <CompaniesPage/>,
        })
    }
})

FlowRouter.route('/admin', {
    name: 'Admin',
    action(){
        checkAuth()
        mount(App, {
            content: <AdminPage/>,
        })
    }
})

FlowRouter.route('/financial', {
    name: 'Financial',
    action(){
        checkAuth()
        mount(App, {
            content: <FinancialPage/>,
        })
    }
})

FlowRouter.route('/drive_settings', {
    name: 'GoogleDriveSettings',
    action() {
        checkAuth()
        mount(App, {
            content: <DriveSettingsPage/>
        })
    }
})

FlowRouter.notFound = {
    action() {
        FlowRouter.go('Root')
    }
}


// callback urls
FlowRouter.route('/auth/google/callback', {
    name: 'GoogleCallback',
    action() {
        //console.log('Meteor absoluteUrl', Meteor.absoluteUrl())
        window.close()
        window.opener.postMessage(JSON.stringify({googleAuthCode:FlowRouter.getQueryParam('code')}), Meteor.absoluteUrl())
    }
})
