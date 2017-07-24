import React from 'react'
import {FlowRouter} from 'meteor/kadira:flow-router'

import SignIn from '../components/authentication/SignIn'
import SignUp from '../components/authentication/SignUp'
import ForgotPassword from '../components/authentication/ForgotPassword'

class AuthenticationPage extends React.Component{
    constructor(props){
        super(props)

        this.state = {
            page: 'SignIn'
        }
    }

    togglePage = (page) => {
        this.setState({page})
    }

    render() {
        return (
            <div className="auth-container">
                {this.renderContent()}
            </div>
        )
    }

    renderContent() {
        const { page } = this.state

        if(page === 'SignIn') {
            return <SignIn toggle={this.togglePage}/>
        } else if(page === 'SignUp') {
            return <SignUp toggle={this.togglePage}/>
        } else if(page === 'ForgotPassword') {
            return <ForgotPassword toggle={this.togglePage}/>
        }
    }
}

export default  AuthenticationPage