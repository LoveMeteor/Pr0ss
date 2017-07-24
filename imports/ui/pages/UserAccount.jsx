import {Roles} from 'meteor/alanning:roles'
import React from 'react'
import classNames from 'classnames'
import ContactInfo from '../components/account/ContactInfo'
import EmailSignature from '../components/account/EmailSignature'
import { ROLES } from '/imports/api/models'

class UserAccount extends React.Component{
    constructor(props){
        super(props)

        this.tabs = [
            {
                label: 'Contact info',
                component: <ContactInfo editable={!!Meteor.userId()} user={props.currentUser} toggleLoader={props.toggleLoader}/>
            }
        ]
        this.tabs.push({
            label: 'Add Signature',
            content: <EmailSignature/>
        })

        this.state = {
            activeTab: this.tabs[0]
        }
    }

    toggleTab(activeTab){
        this.setState({activeTab})
    }

    getTabs(){
        const { activeTab } = this.state

        return <ul>
            {this.tabs.map(item => (
                    <li key={item.label}
                        onClick={this.toggleTab.bind(this, item)}
                        className={classNames({'active': item === activeTab})}
                    >{item.label}</li>
                ))}
        </ul>
    }

    getContent(){
        const { activeTab } = this.state
        if(activeTab.component){
            return React.cloneElement(activeTab.component)
        }else{
            return activeTab.content
        }
    }

    render() {
        return (
            <div className="page-container user-settings">
                <div className="main-content">
                    <div className="tab-container">
                        <h2 className="page-title">user-settings</h2>
                        <div className="tab-controls">
                            {this.getTabs()}
                        </div>
                        <div className="tab-content">
                            {this.getContent()}
                        </div>
                    </div>
                </div>
                <aside className="right-sidebar">
                    <h2 className="title">User info</h2>

                </aside>
            </div>
        )
    }
}
export default UserAccount
