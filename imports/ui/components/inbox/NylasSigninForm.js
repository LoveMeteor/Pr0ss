import React from 'react'
import {Button, Form, FormGroup, FormControl, Col, ControlLabel} from 'react-bootstrap'
import {isValidEmail, isValidPassword} from '../../../api/lib/validation.js'
import config from '../../../api/config'
import {warning} from '/imports/api/lib/alerts'
import Actions from '../../../api/nylas/actions'

export default class NylasSigninForm extends React.Component {
    static propTypes = {
        onCancel: React.PropTypes.func,
        onCompleted: React.PropTypes.func,
        isAddingTeamInbox: React.PropTypes.bool
    }
    constructor(props) {
        super(props)

        this.state = {
            name: '',
            email: '',
            password: '',
            provider: '',
            validation: {
                name: '',
                email: '',
                password: '',
                provider: ''
            },
            isProcessing: false
        }
    }

    render() {
        const {validation, name, email, password, provider, isProcessing} = this.state

        const validationStyle = {
            float: 'right',
            color: 'red',
            paddingRight: 15,
            fontSize: 12
        }

        return (
            <div style={{maxWidth: 500,minWidth: 400}}>
                <h3 style={{textAlign:'center'}}>Add {this.props.isAddingTeamInbox ? 'a Team' : 'an Individual'} Inbox</h3><br/>
                <Form horizontal onSubmit={this.onSubmitSignIn}>
                    <FormGroup controlId="formHorizontalEmail">
                        <Col componentClass={ControlLabel} sm={3}>
                            Full Name
                        </Col>
                        <Col sm={9}>
                            <FormControl type="text" placeholder="Name" value={name} onChange={(evt) => this.setState({name:evt.target.value})} disabled={isProcessing}/>
                        </Col><span style={validationStyle}>{validation.name}</span>
                    </FormGroup>
                    <FormGroup controlId="formHorizontalEmail">
                        <Col componentClass={ControlLabel} sm={3}>
                            Email
                        </Col>
                        <Col sm={9}>
                            <FormControl type="email" placeholder="Email" value={email} onChange={(evt) => this.setState({email:evt.target.value})} disabled={isProcessing}/>
                        </Col><span style={validationStyle}>{validation.email}</span>
                    </FormGroup>

                    <FormGroup controlId="formHorizontalPassword">
                        <Col componentClass={ControlLabel} sm={3}>
                            Password
                        </Col>
                        <Col sm={9}>
                            <FormControl type="password" placeholder="Password" value={password} onChange={(evt) => this.setState({password:evt.target.value})} disabled={isProcessing}/>
                        </Col><span style={validationStyle}>{validation.password}</span>
                    </FormGroup>

                    <FormGroup>
                        <Col componentClass={ControlLabel} sm={3}>
                            Provider
                        </Col>
                        <Col sm={9}>
                            <FormControl componentClass="select" value={provider} onChange={(evt) => this.setState({provider:evt.target.value})} disabled={isProcessing}>
                                <option value="">-----</option>
                                <option value="gmail">Gmail</option>
                                <option value="exchange">Exchange</option>
                                <option value="icloud">iCloud</option>
                                <option value="outlook">Outlook</option>
                                <option value="yahoo">Yahoo</option>
                            </FormControl>
                        </Col><span style={validationStyle}>{validation.provider}</span>
                    </FormGroup>

                    <FormGroup>
                        <Col smOffset={3} sm={10}>
                            <Button bsStyle="default" onClick={this.props.onCancel} disabled={isProcessing}>Cancel</Button>&nbsp;
                            <Button type="submit" bsStyle="primary" disabled={isProcessing}>{isProcessing && <i className="fa fa-refresh fa-spin"></i>}&nbsp;Sign in</Button>
                        </Col>
                    </FormGroup>
                </Form>
            </div>
        )
    }

    onSubmitSignIn = (evt) => {
        evt.preventDefault()
        const {name, email, password, provider, validation} = this.state

        if (name == '') {
            validation.name = 'Name is required'
            return this.setState({validation:Object.assign(this.state.validation, validation)})
        }

        if (!isValidEmail(email)) {
            validation.email = 'Please enter valid e-mail address'
            return this.setState({validation:Object.assign(this.state.validation, validation)})
        }
        if (provider == '') {
            validation.provider = 'Email provider is required'
            return this.setState({validation:Object.assign(this.state.validation, validation)})
        }
        if (!isValidPassword(password, 6)) {
            validation.password = 'Please enter valid password'
            return this.setState({validation:Object.assign(this.state.validation, validation)})
        }


        this.signinData = {
            name,
            email,
            password,
            provider,
            isTeamAccount: this.props.isAddingTeamInbox
        }

        if(provider == 'gmail') {//console.log('gmail inbox redirectUri', config.google.redirectUri)
            const url = require('url')
            const googleUrl = url.format({
                protocol: 'https',
                host: 'accounts.google.com/o/oauth2/auth',
                query: {
                    response_type: 'code',
                    //state: state,
                    client_id: config.google.clientId,
                    redirect_uri: config.google.redirectUri,
                    access_type: 'offline',
                    scope: 'https://www.googleapis.com/auth/userinfo.email \
                            https://www.googleapis.com/auth/userinfo.profile \
                            https://mail.google.com/ \
                            https://www.google.com/m8/feeds \
                            https://www.googleapis.com/auth/calendar',
                    login_hint: email,
                    prompt: 'consent'
                }
            })
            
            window.open(googleUrl, 'Google authentication', 'width=730,height=650')

            window.addEventListener('message', this.receiveMessageFromGoolgeAuthWindow, false)
        } else {
            this.signin()
        }
    }

    signin = () => {
        this.setState({isProcessing: true})
        const signinData = this.signinData
        Meteor.call('addNylasAccount', signinData, (err, res) => {console.log('Signin to Inbox', err, res)
            if(err) {
                console.log(err)
                this.setState({isProcessing: true})
                return warning(err.message)
            }

            setTimeout(() => {
                Actions.changedAccounts()
                if(this.props.onCompleted) this.props.onCompleted()
            }, 6000)
        })
    }

    receiveMessageFromGoolgeAuthWindow = (event) => {
        console.log('Event arrived from other window', event)

        try {
            const json = JSON.parse(event.data)
            const code = json.googleAuthCode
            if(code) {
                const request = require('request')
                const options = {
                    method: 'POST',
                    url: 'https://www.googleapis.com/oauth2/v4/token',
                    form: {
                        code,
                        grant_type: 'authorization_code',
                        client_id: config.google.clientId,
                        client_secret: config.google.clientSecret,
                        redirect_uri: config.google.redirectUri
                    },
                    json: true
                }
                request(options, (error, response, body) => {
                    console.log('GoogleAPIToken result', error, response, body)

                    if(!error && body) {

                        const googleAccessToken = body.access_token
                        const googleRefreshToken = body.refresh_token

                        if(googleAccessToken && googleRefreshToken) {
                            request({
                                method: 'GET',
                                url: `https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${googleAccessToken}`,
                                json: true
                            }, (error, response, body) => {
                                console.log('GoogleUserInfo api result', error, response, body)
                                if(!error && body) {

                                    const googleEmail = body.email

                                    if(googleEmail != this.signinData.email) {
                                        return warning('Registraion email is different from Google authentication email!')
                                    } else {
                                        this.signinData.googleRefreshToken = googleRefreshToken

                                        this.signin()
                                    }
                                }
                            })
                        }
                    }

                })
            }
        } catch (e) {
            return false
        }

    }
}
