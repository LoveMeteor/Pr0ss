import React from 'react'
import {Accounts} from 'meteor/accounts-base'
import {FlowRouter} from 'meteor/kadira:flow-router'
import {isValidEmail} from '../../../api/lib/validation.js'
import {warning, info} from '/imports/api/lib/alerts'

export default class ForgotPassword extends React.Component{
    constructor(props){
        super(props)

        this.state = {
            email: '',
            error: ''
        }
    }

    submit = (e) => {
        e.preventDefault()
        const email = this.state.email.trim()
        if(!isValidEmail(email)) {
            return this.setState({ error: 'Please enter valid e-mail address' })
        }

        this.setState({submitting:true})
        const self = this
        Accounts.forgotPassword({email}, (err) => {
            self.setState({submitting:false})
            if(err) {
                console.error(err)
                return warning(err.message)
            }

            info('Submitted successfully')
            this.toggle()
        })
    }

    focusInput = (event) => {
        event.target.parentElement.classList.add('active')
        this.setState({error: false})
    }

    change = (event) => {
        this.setState({
            [event.target.id]: event.target.value
        })
        if(event.target.value !== ''){
            event.target.parentElement.classList.add('active')
        }
    }


    toggle() {
        if (typeof this.props.toggle === 'function') {
            this.props.toggle('SignIn')
        }
    }
    render() {
        const { email, submitting } = this.state
        return (
            <div className="sign-in-wrap">
                <header className="auth-header">
                    <h2 className="title">Forgot password?</h2>
                </header>
                <form className="auth-form" onSubmit={this.submit}>
                    <div className="flex-input">
                        <label htmlFor="email">Email</label>
                        <input id="email"
                               type="email"
                               onFocus={this.focusInput}
                               value={email}
                               onChange={this.change}
                        />
                    </div>
                    <button className="btnn login-btn" type="submit" disabled={submitting}>{submitting && <i className="fa fa-spinner fa-spin fa-fw"> </i>}Submit</button>
                    {this.state.error ? <span className="warn-msg">{this.state.error}</span> : ''}
                </form>
                <footer className="auth-footer">
                    <button onClick={this.toggle.bind(this)}
                            className="toggle-auth">I thought password
                    </button>
                </footer>
            </div>
        )
    }
}
