import _ from 'underscore'
import React from 'react'
import {Button, Form, FormGroup, FormControl, Col, Modal} from 'react-bootstrap'
import Select from 'react-select'
import {warning} from '/imports/api/lib/alerts'
import {PeopleDesignations, Companies} from '/imports/api/models'
import {insertPeople} from '/imports/api/models/people/methods'


export default class PeopleForm extends React.Component {
    static propTypes = {
        people: React.PropTypes.array,
        onSaved: React.PropTypes.func
    }

    constructor(props) {
        super(props)

        this.state = {
            people: props.people,

            designations: PeopleDesignations.find().fetch(),
            companies: Companies.find().fetch()
        }
    }


    changeState = (obj, key, val) => {
        obj[key] = val

        this.setState({people:this.state.people})

        if(this.props.onChange) this.props.onChange(this.state.people)
    }

    onClickRemovePerson = (index) => {
        const {people} = this.state
        people.splice(index, 1)
        this.setState({people})

        if(this.props.onChange) this.props.onChange(people)
    }

    render() {
        const {people, designations, companies} = this.state

        const designationOptions = designations.map(d => ({value: d._id, label: d.name}))

        const companyOptions = companies.map(c => ({value: c._id, label: c.name}))


        return (
            <div>
                <Form style={{padding: 10}} horizontal onSubmit={this.onSubmit}>
                    <table className='table table-condensed'>
                        <thead>
                        <tr>
                            <th width="20%">Name</th>
                            <th width="25%">Email</th>
                            <th width="15%">Designation</th>
                            <th width="15%">Role</th>
                            <th width="13%">Company</th>
                            <th width="10%">Position</th>
                            <th></th>
                        </tr>
                        </thead>
                        <tbody>
                        {
                            people.map((person, index) => {
                                let designation, designationValue, roleOptions = [], roleValue, roleAddable = false
                                if (person.designation_id) {
                                    designation = _.findWhere(designations, {_id: person.designation_id})
                                    if (designation) {
                                        designationValue = {value: designation._id, label: designation.name}
                                        roleOptions = designation.roles.map(r => ({value: r.name, label: r.name}))
                                        if(person.role) roleValue = _.findIndex(designation.roles, {name:person.role}) > -1 ? {value: person.role, label: person.role} : null
                                        roleAddable = designation.role_addable
                                    }
                                }
                                let companyValue
                                if (person.company_id) {
                                    const company = _.findWhere(companies, {_id: person.company_id})
                                    if (company) companyValue = {value: company._id, label: company.name}
                                }
                                return (
                                    <tr key={index}>
                                        <td><FormControl type="text" value={person.name} onChange={(e) => this.changeState(person, 'name', e.target.value)}/></td>
                                        <td><FormControl type="email" value={person.email} onChange={(e) => this.changeState(person, 'email', e.target.value)}/></td>
                                        <td><Select clearable={false} required options={designationOptions} value={designationValue} onChange={(item) => this.changeState(person, 'designation_id', item.value)}/></td>
                                        <td><Select clearable={false} required options={roleOptions} value={roleValue} onChange={(item) => this.changeState(person, 'role', item.value)}/></td>
                                        <td><Select clearable={false} options={companyOptions} value={companyValue} onChange={(item) => this.changeState(person, 'company_id', item.value)}/></td>
                                        <td><FormControl type="text" value={person.position} onChange={(e) => this.changeState(person, 'position', e.target.value)}/></td>
                                        <td><Button bsSize="xsmall" onClick={() => this.onClickRemovePerson(index)}><i className="fa fa-trash"/></Button></td>
                                    </tr>
                                )
                            })
                        }
                        </tbody>
                    </table>
                    <FormGroup>
                        <Col sm={12} style={{textAlign: 'right'}}>
                            <Button type="submit" bsStyle="primary">Convert</Button>
                        </Col>
                    </FormGroup>
                </Form>
            </div>

        )
    }

    onSubmit = (evt) => {
        evt.preventDefault()

        const {people} = this.state

        console.log(people)
        try {
            insertPeople.call({people})
            if (this.props.onSaved) this.props.onSaved()
        } catch (e) {
            console.log(e)
            warning(e.error)
        }

    }
}
