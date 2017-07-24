import _ from 'underscore'
import React from 'react'
import {Button, Form, FormGroup, FormControl, Col} from 'react-bootstrap'
import {warning} from "/imports/api/lib/alerts"
import {CompanyTypes} from '/imports/api/models'
import {insertCompanyType, updateCompanyType} from '/imports/api/models/companies/methods'


export default class CompanyTypeForm extends React.Component {
    static propTypes = {
        type: React.PropTypes.object,
        onSaved: React.PropTypes.func
    }

    constructor(props) {
        super(props)

        this.state = {
            name: props.type ? props.type.name : ''
        }
    }

    render() {
        const {name} = this.state
        return (
            <div>
                <Form style={{padding: 10}} horizontal onSubmit={this.onSubmit}>
                    <FormGroup controlId="formHorizontalName">
                        <Col sm={12}>
                            <FormControl type="text" placeholder="Name" value={name}
                                         onChange={(evt) => this.setState({name: evt.target.value})}/>
                        </Col>
                    </FormGroup>

                    <FormGroup>
                        <Col sm={12} style={{textAlign: 'right'}}>
                            <Button type="submit" bsStyle="primary">{this.props.type ? "Update" : "Create"}</Button>
                        </Col>
                    </FormGroup>
                </Form>
            </div>

        )
    }

    onSubmit = (evt) => {
        evt.preventDefault()

        const data = {name} = this.state


        try{
            let typeId
            if (this.props.type) {
                typeId = this.props.type._id
                data._id = typeId
                updateCompanyType.call(data)
            } else {
                typeId = insertCompanyType.call(data)
            }

            if (this.props.onSaved) this.props.onSaved(CompanyTypes.findOne({_id: typeId}), this.props.type != null)
        } catch(e) {
            console.log(e)
            warning(e.message)
        }
    }
}
