import {Roles} from 'meteor/alanning:roles'
import {FlowRouter} from 'meteor/kadira:flow-router'
import React from 'react'
import classNames from 'classnames'
import Dialer from '../dialer/Dialer'
import '../popup/PopoverStore'
import PopoverActions from '../popup/PopoverActions'
import {ROLES} from '/imports/api/models'

class NavigationItem extends React.Component{
    constructor(){
        super()
    }

    toggleTopMenu(event) {
        const { subMenu } = this.refs
        const { item } = this.props
        $(subMenu).parent().siblings('.top-nav-item').find('.sub-nav-items').slideUp()
        $(subMenu).parent().siblings('.top-nav-item').removeClass('active')
        $(subMenu).slideToggle()
        $(subMenu).parent().toggleClass('active')
        this.goToRoute(item.route)
    }

    goToRoute(route){
        if(!route) return

        if(typeof route === 'string') FlowRouter.go(FlowRouter.path(route))
        else FlowRouter.go(FlowRouter.path(route.name, route.params))
    }

    renderTopLevelItem(item){
        const subItemList = item.subItems.map((subItem,index) => this.renderLowLevelItem(subItem,index))
        const routesList = item.subItems.map(item => typeof item.route === 'string' ? item.route : item.route.name )

        return (
            <li className="top-nav-item">
                <div
                  onClick={this.toggleTopMenu.bind(this)}
                  className={classNames('nav-item-label',{'active': routesList.indexOf(FlowRouter.getRouteName())>-1})}>{item.label}</div>
                <ul className="sub-nav-items" ref="subMenu">{subItemList}</ul>
            </li>
        )
    }

    renderLowLevelItem(item,index){
        const isActive = typeof item.route === 'string' ?
            FlowRouter.getRouteName() === item.route :
            FlowRouter.getRouteName() === item.route.name && FlowRouter.current().params.id === item.route.params.id
        return (
            <li key={item.label+index}
                onClick={this.goToRoute.bind(this,item.route)}
                className={classNames('sub-item', {'active': isActive})}
            >{item.label}</li>
        )
    }

    renderSimpleItem(item){
        return (
            <li onClick={this.goToRoute.bind(this,item.route)}
                className={classNames('nav-item', {'active': FlowRouter.getRouteName() === item.route})}
            >{item.label}</li>
        )
    }

    render(){
        const { item } = this.props

        if(item.topLevel) return this.renderTopLevelItem(item)

        else return this.renderSimpleItem(item)
    }
}

class Aside extends React.Component{
    constructor(props){
        super(props)

        this.pages = [
            {
                label: 'Dashboard',
                route: 'Dashboard'
            },{
                label: 'Inbox',
                route: 'Inbox'
            },
            {
                label: 'Projects',
                route: 'Projects',
            },
            {
                label: 'Deals',
                topLevel: true,
                route: 'Deals',
                subItems: [
                    {
                        label: 'Leads',
                        route: 'Leads'
                    },
                    {
                        label: 'Opportunities',
                        route: 'Opportunities'
                    },
                    {
                        label: 'Orders',
                        route: 'Orders'
                    },
                    {
                        label: 'Tickets',
                        route: 'Tickets'
                    },
                ]
            },
            {
                label: 'Contacts',
                topLevel: true,
                subItems: [
                    {
                        label: 'People',
                        route: 'People'
                    },
                    {
                        label: 'Companies',
                        route: 'Companies'
                    },
                    {
                        label: 'Email Contacts',
                        route: 'Contacts'
                    }

                ]
            },
            {
                label: 'Financial',
                route: 'Financial'
            },
            {
                label: 'Settings',
                topLevel: true,
                subItems: [
                    {
                        label: 'Account',
                        route: 'Account'
                    },
                    {
                        label: 'Inbox',
                        route: 'InboxSettings'
                    },
                ]
            }
        ]

        //admin & super admin & employer allow
        if(Roles.userIsInRole(props.currentUser._id, [ROLES.ADMIN, ROLES.SALES])){
            this.pages = this.pages.map(item => {
                if(item.label === 'Settings'){
                    item.subItems.push({
                        label: 'Admin',
                        route: 'Admin'
                    })
                }
                return item
            })
        }

      if(Roles.userIsInRole(props.currentUser._id, [ROLES.ADMIN])) {
        this.pages = this.pages.map(item => {
          if(item.label === 'Settings'){
            item.subItems.push({
              label: 'Google Drive',
              route: 'GoogleDriveSettings'
            })
          }
          return item
        })
      }
    }

    renderList(){
        return (
            <nav className="nav-list">
                <ul>
                    {this.pages.map((item,index) => <NavigationItem key={item.label+item.index}
                                                                  item={item}/>)}
                </ul>
            </nav>
        )
    }

    render() {
        const { currentUser } = this.props
        return (
            <aside className={classNames('control-aside',{'active': currentUser})}>
                {this.renderList()}

                <div className="call-phone" onClick={this.onClickCall}><i className="fa fa-phone"></i></div>

            </aside>
        )
    }

    onClickCall = (evt) => {
        const clientRect = evt.currentTarget.getBoundingClientRect()

        PopoverActions.openPopover(
            <Dialer />,
            {originRect: clientRect, direction: 'up'}
        )

    }
}
export default Aside
