import _ from 'underscore'
import React from 'react'
import TrackerReact from 'meteor/ultimatejs:tracker-react'
import {Button, Table, InputGroup, FormControl} from 'react-bootstrap'

import Contacts from '/imports/api/models/contacts/contacts'

const PAGESIZE = 100
export default class ContactsList extends TrackerReact(React.Component) {
    static propTypes = {
        onSelectContacts: React.PropTypes.func,
        onCreateContact: React.PropTypes.func,
        onConvertToPeople: React.PropTypes.func,
        updatedContact: React.PropTypes.object,
        removedContact: React.PropTypes.object
    }

    constructor(props) {
        super(props)

        this.contacts = []
        this.fullyLoaded = false
        this.state = {
            page: 1,
            keyword: null,
            selectedContacts: []
        }
    }

    componentDidMount() {

    }

    componentWillUnmount() {

    }

    componentWillReceiveProps(nextProps) {
        const {removedContact} = nextProps

        if(removedContact) {
            this.setState({removedContact})
        }
    }

    loadContacts() {
        const {keyword, page, removedContact} = this.state

        const filters = {removed:{$ne:true}}
        if(keyword && keyword.length) {
            const regx = {$regex: keyword, $options: 'i'}
            filters['$or'] = [{email: regx}, {name: regx}]
        }

        const result = Contacts.find(filters, {skip:(page-1)*PAGESIZE,limit:PAGESIZE,sort:{name:1}}).fetch()
        if(result.length!=PAGESIZE) this.fullyLoaded = true
        result.forEach((c) => {
            const index = this.contacts.findIndex((c1) => c1._id==c._id)
            if(index >= 0) {
                this.contacts.splice(index, 1, c)
            } else {
                this.contacts.push(c)
            }
        })
        //this.contacts = _.uniq(this.contacts, (c)=>c.email.toLowerCase())
        if(removedContact) {
            const index = this.contacts.findIndex((c) => c._id == removedContact._id)
            if(index>-1) this.contacts.splice(index, 1)
        }

        return this.contacts
    }

    render() {
        return (
            <div className="contact-list">
                {this.renderToolbar()}

                {this.renderContent()}
            </div>
        )
    }

    renderToolbar() {
        return (
            <div className="toolbar-panel">
                <div style={{flex: 1}}>
                    {/*<Button bsStyle="primary" onClick={()=>{this.props.onCreateContact&&this.props.onCreateContact()}}><i className="fa fa-user-plus"/></Button>*/}
                    <Button bsStyle="primary" onClick={() => {this.props.onConvertToPeople&&this.props.onConvertToPeople()}} disabled={this.state.selectedContacts.length===0}><i className="fa fa-address-book"/></Button>
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
                        <th width="20%">Name</th>
                        <th width="25%">Email</th>
                        <th width="15%">Phone Numbers</th>
                        <th width="25%">Description</th>
                        <th width="10%">Inbox</th>
                    </tr>
                    </thead>
                    <tbody onScroll={this.onScrollContactList}>
                    {this.renderContacts()}
                    </tbody>
                </Table>
            </div>
        )
    }
    renderContacts() {
        const {selectedContacts} = this.state

        const contacts = this.loadContacts()
        if (!contacts || contacts.length == 0) return


        const compare = (c1, c2) => {
            if (c1.name > c2.name) return 1
            else if (c1.name < c2.name) return -1
            else {
                if(c1.email > c2.email) return 1
                else if(c1.email < c2.email) return -1
                return 0
            }
        }
        return contacts.sort(compare).map((contact, index) => {
            const selected = _.findIndex(selectedContacts, {_id:contact._id})>-1
            return (
                <tr className={selected ? 'focused' : ''} key={contact._id} onClick={(e) => this.selectContact(contact)}>
                    <td width="5%"><input type="checkbox" checked={selected} onChange={(e) => {
                        e.stopPropagation()
                        if(e.target.checked) {
                            this.selectContact(contact)
                        } else {
                            this.deselectContact(contact)
                        }
                    }}/></td>
                    <td width="20%">{contact.name}</td>
                    <td width="25%">{contact.email}</td>
                    <td width="15%">{contact.phone_numbers}</td>
                    <td width="25%">{contact.description}</td>
                    <td width="10%">{contact.account() ? contact.account().name : ''}</td>
                </tr>
            )
        })
    }

    selectContact = (contact) => {
        const {selectedContacts} = this.state

        const index = _.findIndex(selectedContacts, {_id:contact._id})

        if(index == -1) {
            selectedContacts.push(contact)
        }
        this.setState({selectedContacts})

        if(this.props.onSelectContacts) this.props.onSelectContacts(selectedContacts)
    }

    deselectContact = (contact) => {
        const {selectedContacts} = this.state

        const index = _.findIndex(selectedContacts, {_id:contact._id})

        if(index > -1) {
            selectedContacts.splice(index, 1)
        }

        this.setState({selectedContacts})

        if(this.props.onSelectContacts) this.props.onSelectContacts(selectedContacts)
    }

    onScrollContactList = (evt) => {
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
            this.contacts = []
            this.fullyLoaded = false
            this.setState({keyword,page:1})
        }, 500)
    }
}
