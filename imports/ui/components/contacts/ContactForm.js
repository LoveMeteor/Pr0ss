import React from 'react'
import {Button, Form, FormGroup, FormControl, Col, ControlLabel} from 'react-bootstrap'
import {warning} from "/imports/api/lib/alerts"
import {Contacts} from '/imports/api/models'
import BlockUi from 'react-block-ui';
import 'react-block-ui/style.css';
import { Loader, Types } from 'react-loaders';
import 'loaders.css/loaders.min.css';



export default class ContactForm extends React.Component {
    static propTypes = {
        contact: React.PropTypes.object,
        onSaved: React.PropTypes.func
    }

    constructor(props) {
        super(props)

        this.state = {
            name: props.contact ? props.contact.name : '',
            email: props.contact ? props.contact.email : '',
            description: props.contact ? props.contact.description : '',
            phone_numbers: props.contact ? props.contact.phone_numbers : [],
            blocking: false
        }
    }

    render() {
        const {name, email, description, phone_numbers} = this.state

        return (
          <div>
            <Form style={{padding: 10}} horizontal onSubmit={this.onSubmit}>
                <FormGroup controlId="formHorizontalName">
                    <Col sm={3}>
                        Name
                    </Col>
                    <Col sm={9}>
                        <FormControl type="text" placeholder="Name" value={name}
                                     onChange={(evt) => this.setState({name: evt.target.value})}/>
                    </Col>
                </FormGroup>
                <FormGroup controlId="formHorizontalEmail">
                    <Col sm={3}>
                        Email
                    </Col>
                    <Col sm={9}>
                        <FormControl type="email" placeholder="Email" value={email}
                                     onChange={(evt) => this.setState({email: evt.target.value})}/>
                    </Col>
                </FormGroup>
                <FormGroup controlId="formHorizontalDescription">
                    <Col sm={12}>
                        <ControlLabel>Description</ControlLabel>
                        <FormControl componentClass="textarea" placeholder="" value={description}
                                     onChange={(evt) => this.setState({description: evt.target.value})}/>
                    </Col>
                </FormGroup>

                <FormGroup>
                    <Col sm={12} style={{textAlign:'right'}}>
                        <Button type="submit" bsStyle="primary">{this.props.contact ? "Update" : "Create"}</Button>
                    </Col>
                </FormGroup>
            </Form>
          </div>

        )
    }

    onSubmit = (evt) => {
        evt.preventDefault()

        let data = {name, email, description, phone_numbers} = this.state

        if (this.props.contact) data._id = this.props.contact._id
        this.props.toggleLoader(true);
        delete data.blocking
        Meteor.call('insertOrUpdateContact', data, (err, contactId) => {
            this.props.toggleLoader(false)
            if (err) return warning(err.message)

            if (this.props.onSaved) this.props.onSaved(Contacts.findOne({_id:contactId}), this.props.contact != null)
        })
    }
}
