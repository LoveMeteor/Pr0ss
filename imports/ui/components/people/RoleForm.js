import React from 'react'
import {Button, Form, FormGroup, FormControl, Col, Alert} from 'react-bootstrap'
import {warning} from '/imports/api/lib/alerts'
import {updateDesignation} from '/imports/api/models/people/methods'
import {PeopleDesignations} from '/imports/api/models'
import SimpleSchema from 'simpl-schema'

export default class RoleForm extends React.Component {
    static propTypes = {
        onSaved: React.PropTypes.func
    }

    constructor(props) {
        super(props)

        this.state = {
            name: props.type ? props.type.name : '',
            error: null,
        }
    }

    render() {
        const {name} = this.state
        return (
            <div>
                <Alert bsStyle='danger' className={ !this.state.error ? 'hide' : '' }>
                    {this.state.error}
                </Alert>
                <Form style={{padding: 10}} horizontal onSubmit={this.onSubmit}>
                    <FormGroup controlId="formHorizontalName">
                        <Col sm={12}>
                            {this.props.designation.name}
                        </Col>
                    </FormGroup>
                    <FormGroup controlId="formHorizontalName">
                        <Col sm={12}>
                            <FormControl type="text" placeholder="Role name" value={name}
                                         onChange={(evt) => this.setState({name: evt.target.value})}/>
                        </Col>
                    </FormGroup>


                    <FormGroup>
                        <Col sm={12} style={{textAlign: 'right'}}>
                            <Button type="submit" bsStyle="primary">{this.props.type ? 'Update' : 'Create'}</Button>
                        </Col>
                    </FormGroup>
                </Form>
            </div>

        )
    }

    onSubmit = (evt) => {
        evt.preventDefault()
        const {name} = this.state

        try{
            new SimpleSchema({
              name: {
                type: String,
                max: 250,
                min: 1
              }
            }).validate({name})
            this.props.designation.roles.push({name, is_custom:true})
            updateDesignation.call(this.props.designation)

            if (this.props.onSaved) this.props.onSaved(PeopleDesignations.findOne({_id: this.props.designation._id}), this.props.designation != null)
        } catch(e) {
            // warning is displayed under backdrop
            //warning(e.message)
          this.setState({
              error: e.message || e.reason
          })
        }
    }
}
