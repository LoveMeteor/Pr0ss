import React from 'react'
import {FlowRouter} from 'meteor/kadira:flow-router'
import {isValidEmail, isValidPassword} from '../../../api/lib/validation.js'
import {warning, info} from '/imports/api/lib/alerts'


class SignUp extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            validation: {
                email: '',
                password: '',
                username: ''
            },
            firstName: '',
            lastName: '',
            email: '',
            password: '',
            repeatPassword: '',
            username: ''
        }
    }

    toggle() {
        if (typeof this.props.toggle === 'function') {
            this.props.toggle('SignIn')
        }
    }

    Check(validation) {
        this.setState({validation: Object.assign(this.state.validation, validation)})
    }

    emailValidationError() {
        const {validation} = this.state

        if (validation.email) {
            return validation.email
        }
    }

    submit(event) {

        event.preventDefault()
        const {username, password, email, repeatPassword, validation, firstName, lastName} = this.state
        if (username == '') {
            validation.username = 'Field is required'
            return this.Check(validation)
        } else if (username.length < 3) {
            validation.username = 'Username must be longer'
            return this.Check(validation)
        }
        if (!isValidEmail(email)) {
            validation.email = 'Please enter valid e-mail address'
            return this.Check(validation)
        }
        if (!isValidPassword(password, 6)) {
            validation.password = 'Please enter valid password'
            return this.Check(validation)
        }
        if (password && password !== repeatPassword) {
            validation.password = 'Passwords doesn\'t match'
            return this.Check(validation)
        }

        this.userRegistrationData = {
                username,
                email,
                password,
                firstName,
                lastName
            }

        this.userRegistration()
    }

    userRegistration() {
        const userData = this.userRegistrationData
        Meteor.call('userRegistration', userData, (err, res) => {console.log('Signup', res)
            if(err) {
                console.log(err)
                return warning(err.message)
            }
            const {validation} = res
            if (validation && validation.email || validation.username) {
                this.Check(validation)
            } else {
               info('Create user successfully')
               this.toggle()
            }
        })
    }

    focusInput(event) {
        const {validation} = this.state
        event.target.parentElement.classList.add('active')
        if (validation[event.target.id]) {
            this.setState({validation: Object.assign(validation, {[event.target.id]: ''})})
        }
    }

    blurInput(event) {
        const value = event.target.value
        const {validation} = this.state
        if (value === '') {
            event.target.parentElement.classList.remove('active')
        }
        switch (event.target.id) {
            case 'email':
                if (!isValidEmail(value))
                    this.setState({validation: Object.assign(validation, {email: 'Please enter valid e-mail address'})})
                break
            case 'username':
                if (value === '')
                    this.setState({validation: Object.assign(validation, {username: 'Username is required'})})
                break
            case 'repeatPassword':
                if (value !== this.state.password)
                    this.setState({validation: Object.assign(validation, {password: 'Passwords doesn\'t match'})})
                break
            default:
                return true
        }
    }

    change(event) {
        this.setState({
            [event.target.id]: event.target.value
        })
        if (event.target.value !== '') {
            event.target.parentElement.classList.add('active')
        }
    }

    render() {
        const {validation, firstName, lastName, username, email, password, repeatPassword} = this.state
        return (
            <div className="sign-up-wrap">
                <header className="auth-header">
                    <h2 className="title">Create new account</h2>
                </header>
                <form className="auth-form" onSubmit={this.submit.bind(this)}>
                    <div className="flex-input">
                        <label htmlFor="firstName">First name</label>
                        <input id="firstName"
                               type="text"
                               onFocus={this.focusInput.bind(this)}
                               onBlur={this.blurInput.bind(this)}
                               value={firstName}
                               onChange={this.change.bind(this)}
                        />
                    </div>
                    <div className="flex-input">
                        <label htmlFor="lastName">Last name</label>
                        <input id="lastName"
                               type="text"
                               onFocus={this.focusInput.bind(this)}
                               onBlur={this.blurInput.bind(this)}
                               value={lastName}
                               onChange={this.change.bind(this)}
                        />
                    </div>
                    <div className="flex-input">
                        <label htmlFor="username">Username</label>
                        <input id="username"
                               type="text"
                               onFocus={this.focusInput.bind(this)}
                               onBlur={this.blurInput.bind(this)}
                               value={username}
                               onChange={this.change.bind(this)}
                        />
                        <span className="validation">{validation.username}</span>
                    </div>
                    <div className="flex-input-select">
                        <label htmlFor="email">Email</label>
                        <input id="email"
                               type="email"
                               onFocus={this.focusInput.bind(this)}
                               onBlur={this.blurInput.bind(this)}
                               value={email}
                               onChange={this.change.bind(this)}
                        />
                        <span className="validation">{this.emailValidationError()}</span>
                    </div>
                    <div className="flex-input">
                        <label htmlFor="password">Password</label>
                        <input id="password"
                               type="password"
                               onFocus={this.focusInput.bind(this)}
                               onBlur={this.blurInput.bind(this)}
                               value={password}
                               onChange={this.change.bind(this)}
                        />
                        <span className="validation">{validation.password}</span>
                    </div>
                    <div className="flex-input">
                        <label htmlFor="repeatPassword">Repeat password</label>
                        <input id="repeatPassword"
                               type="password"
                               onFocus={this.focusInput.bind(this)}
                               onBlur={this.blurInput.bind(this)}
                               value={repeatPassword}
                               onChange={this.change.bind(this)}
                        />
                    </div>
                    <button className="btnn login-btn" type="submit">Registrate</button>
                </form>
                <footer className="auth-footer">
                    <button onClick={this.toggle.bind(this)}
                            className="toggle-auth">I have account
                    </button>
                </footer>
            </div>
        )
    }
}
export default SignUp
