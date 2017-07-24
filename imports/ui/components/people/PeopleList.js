import _ from 'underscore'
import React from 'react'
import TrackerReact from 'meteor/ultimatejs:tracker-react'
import {Table, Button, InputGroup, FormControl, Modal, Panel, ListGroup, ListGroupItem, Label, Grid, Row, Col} from 'react-bootstrap'

import People from '/imports/api/models/people/people'
import {removePerson} from '/imports/api/models/people/methods'
import PersonForm from './PersonForm'

const PAGESIZE = 100
export default class PeopleList extends TrackerReact(React.Component) {
    static propTypes = {
        onSelect: React.PropTypes.func,
        onCreatePerson: React.PropTypes.func,
        updatedPerson: React.PropTypes.object,
        removedPerson: React.PropTypes.object
    }

    constructor(props) {
        super(props)

        this.people = []
        this.fullyLoaded = false
        this.state = {
            page: 1,
            keyword: null,
            expanded: []
        }
    }

    componentWillReceiveProps(nextProps) {
        const {removedPerson} = nextProps

        if(removedPerson) {
            this.setState({ removedPerson })
        }
    }

    loadData() {
        const {keyword, page, removedPerson} = this.state

        const filters = {removed:{$ne:true}}
        if(keyword && keyword.length) {
            const regx = {$regex: keyword, $options: 'i'}
            filters['$or'] = [{email: regx}, {name: regx}]
        }

        const result = People.find(filters, {skip:(page-1)*PAGESIZE,limit:PAGESIZE,sort:{name:1}}).fetch()
        if(result.length!=PAGESIZE) this.fullyLoaded = true
        result.forEach(c => {
            const index = this.people.findIndex(c1 => c1._id==c._id)
            if(index >= 0) {
                this.people.splice(index, 1, c)
            } else {
                this.people.push(c)
            }
        })

        if(removedPerson) {
            const index = this.people.findIndex(c => c._id == removedPerson._id)
            if(index>-1) this.people.splice(index, 1)
        }

        return this.people
    }

    render() {
        return (
            <div className="contact-list">
                {this.renderToolbar()}
                {this.renderContent()}
                {this.renderModal()}
            </div>
        )
    }


    renderToolbar() {
        return (
            <div className="toolbar-panel">
                <div style={{flex: 1}}>
                    <Button bsStyle="primary" onClick={() => this.setState({showModal:true, creating:true})}><i className="fa fa-user-plus"/></Button>
                </div>
                <div style={{width:250}}>
                    <InputGroup>
                        <InputGroup.Addon><i className="fa fa-search"/></InputGroup.Addon>
                        <FormControl type="text" placeholder="Search..." onChange={this.onChangeSearch} />
                    </InputGroup>
                </div>
            </div>
        )
    }

    renderContent() {
        return (
            <div className="content-panel">
                <Table striped hover>
                    <thead>
                    <tr>
                        <th width="5%">#</th>
                        <th width="15%">Name</th>
                        <th width="15%">Email</th>
                        <th width="15%">Designation</th>
                        <th width="15%">Role</th>
                        <th width="15%">Company</th>
                        <th width="15%">Position</th>
                        <th width="5%"></th>
                    </tr>
                    </thead>
                    <tbody onScroll={this.onScrollList}>
                    {this.renderRows()}
                    </tbody>
                </Table>
            </div>
        )
    }

    renderRows() {
        const people = this.loadData()
        if (!people || people.length == 0) return


        const compare = (c1, c2) => {
            if (c1.name > c2.name) return 1
            else if (c1.name < c2.name) return -1
            else {
                if(c1.email > c2.email) return 1
                else if(c1.email < c2.email) return -1
                return 0
            }
        }

        const trs = []

        people.sort(compare).forEach(person => {
            trs.push(<tr key={person._id}>
                <td width="5%"><Button bsSize="xsmall" onClick={() => this.onToggleRow(person)}>{this.isExpanded(person)?<i className="fa fa-minus"/>:<i className="fa fa-plus"/>}</Button></td>
                <td width="15%">{person.name}</td>
                <td width="15%">{person.defaultEmail()}</td>
                <td width="15%">{person.designation() ? person.designation().name : ''}</td>
                <td width="15%">{person.role}</td>
                <td width="15%">{person.company() ? person.company().name : ''}</td>
                <td width="15%">{person.position}</td>
                <td width="5%">
                    <Button bsSize="xsmall" onClick={() => this.onEditPerson(person)}><i className="fa fa-edit"/></Button>&nbsp;
                    <Button bsStyle="danger" bsSize="xsmall" onClick={() => this.onRemovePerson(person)}><i className="fa fa-trash"/></Button>
                </td>
            </tr>)

            if(this.isExpanded(person)) {
                trs.push(<tr key={`expanded-${person._id}`}>
                    <td></td>
                    <td colSpan={7} width="100%">{this.renderPersonDetails(person)}</td>
                </tr>)
            }
        })

        return trs
    }

    renderPersonDetails(person) {
        return (
            <Grid fluid>
                <Row>
                    <Col md={4}>
                        <Panel header="Social Info">
                            <ListGroup>
                                <ListGroupItem><Label>Twitter</Label>&nbsp;{person.twitter}</ListGroupItem>
                                <ListGroupItem><Label>Facebook</Label>&nbsp;{person.facebook}</ListGroupItem>
                                <ListGroupItem><Label>LinkedIn</Label>&nbsp;{person.linkedin}</ListGroupItem>
                            </ListGroup>
                        </Panel>
                    </Col>
                    <Col md={4}>
                        <Panel header="Emails">
                            <Table>
                                <thead><tr>
                                    <th width="60%">Email</th>
                                    <th width="25%">Type</th>
                                    <th width="15%">Default</th>
                                </tr></thead>
                                <tbody>
                                {
                                    person.emails && person.emails.map((e,i) => (
                                        <tr key={`email-${person._id}-#${i}`}>
                                            <td width="60%">{e.email}</td>
                                            <td width="25%">{e.type}</td>
                                            <td width="15%">{e.is_default?'YES':''}</td>
                                        </tr>
                                    ))
                                }
                                </tbody>
                            </Table>
                        </Panel>
                    </Col>
                    <Col md={4}>
                        <Panel header="Phone numbers">
                            <Table>
                                <thead><tr>
                                    <th width="40%">Number</th>
                                    <th width="20%">Extension</th>
                                    <th width="25%">Type</th>
                                    <th width="15%">Default</th>
                                </tr></thead>
                                <tbody>
                                {
                                    person.phone_numbers && person.phone_numbers.map((p,i) => (
                                        <tr key={`phone-number-${person._id}-#${i}`}>
                                            <td width="40%">{p.number}</td>
                                            <td width="20%">{p.extension}</td>
                                            <td width="25%">{p.type}</td>
                                            <td width="15%">{p.is_default?'YES':''}</td>
                                        </tr>
                                    ))
                                }
                                </tbody>
                            </Table>
                        </Panel>
                    </Col>
                </Row>
            </Grid>
        )
    }
    renderModal() {
        const {showModal, selectedPerson, creating} = this.state
        const title = selectedPerson&&!creating ? 'Edit person' : 'Create person'

        return (
            <Modal show={showModal} onHide={() => {
                this.setState({showModal: false})
            }}>
                <Modal.Header closeButton><Modal.Title><i className="fa fa-vcard-o"/> {title}</Modal.Title></Modal.Header>
                <Modal.Body>
                    <PersonForm
                        person={!creating?selectedPerson:null}
                        onSaved={this.onSavedPerson}
                    />
                </Modal.Body>
            </Modal>
        )
    }

    onToggleRow = (person) => {
        const {expanded} = this.state
        const index = _.findIndex(expanded, {_id:person._id})
        if(index > -1) expanded.splice(index, 1)
        else expanded.push(person)

        this.setState({expanded})
    }
    isExpanded = (person) => _.findIndex(this.state.expanded, {_id:person._id}) > -1


    onScrollList = (evt) => {
        const el = evt.target

        if (!this.fullyLoaded && el.scrollTop + el.clientHeight == el.scrollHeight) {
            if (this.scrollTimeout) {
                clearTimeout(this.scrollTimeout)
            }

            this.scrollTimeout = setTimeout(() => {
                const page = this.state.page
                this.setState({page:page+1})
            }, 500)

            evt.preventDefault()
        }
    }

    onChangeSearch = (evt) => {
        if(this.searchTimeout) { clearTimeout(this.searchTimeout) }

        const keyword = evt.target.value
        this.searchTimeout = setTimeout(() => {
            this.people = []
            this.fullyLoaded = false
            this.setState({keyword,page:1})
        }, 500)
    }

    onEditPerson = (person) => {
        this.setState({
            showModal: true,
            selectedPerson: person,
            creating: false
        })
    }
    onRemovePerson = (person) => {

        if (confirm(`Are you sure to remove ${person.name}?`)) {
            try {
                removePerson.call({_id:person._id}, error => !error && this.setState({ removedPerson: person }))
            } catch(e) {
                console.error(e)
            }
        }
    }

    onSavedPerson = () => {
        this.setState({showModal: false})
    }
}
