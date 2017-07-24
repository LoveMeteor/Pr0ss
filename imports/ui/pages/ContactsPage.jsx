import _ from 'underscore'
import React from 'react'
import {Modal} from 'react-bootstrap'
import ContactsList from '../components/contacts/ContactsList'
import ContactOverview from '../components/contacts/ContactOverview'
import ContactForm from '../components/contacts/ContactForm'
import {warning} from '/imports/api/lib/alerts'
import PersonForm from '../components/people/PersonForm'
import PeopleForm from '../components/people/PeopleForm'


export default class ContactsPage extends React.Component {
    constructor(props) {
        super(props)

        this.state = {
            showContactModal: false,
            creating: false,
            selectedContacts: [],
            updatedContact: null,
            removedContact: null
        }
    }

    render() {
        return (
            <div className="contact-page">
                <ContactsList
                    onSelectContacts={(contacts) => this.setState({selectedContacts: contacts})}
                    onCreateContact={() => this.setState({showContactModal: true, creating:true})}
                    onConvertToPeople={() => this.setState({showPeopleModal: true})}
                    updatedContact={this.state.updatedContact}
                    removedContact={this.state.removedContact}
                />
                <ContactOverview
                    contact={_.last(this.state.selectedContacts)}
                    onRemoveContact={this.onRemoveContact}
                    onEditContact={() => this.setState({showContactModal: true, creating:false})}
                    onConvertToPerson={(contact) => {this.setState({
                        showPersonModal: true
                    })}}
                />
                {this.renderContactModal()}
                {this.renderPersonModal()}
                {this.renderPeopleModal()}
            </div>
        )
    }

    renderContactModal() {
        const {showContactModal, selectedContacts, creating} = this.state
        const selectedContact = _.last(selectedContacts)
        const title = selectedContact&&!creating ? 'Edit Contact' : 'Create Contact'

        return (
            <Modal show={showContactModal} onHide={() => {
                this.setState({showContactModal: false})
            }}>
                <Modal.Header closeButton><Modal.Title><i className="fa fa-vcard-o"/> {title}</Modal.Title></Modal.Header>
                <Modal.Body>
                    <ContactForm
                        contact={!creating?selectedContact:null}
                        onSaved={this.onSavedContact}
                        toggleLoader={this.props.toggleLoader}
                    />
                </Modal.Body>
            </Modal>
        )
    }

    renderPersonModal() {
        const {showPersonModal, selectedContacts} = this.state
        const contact = _.last(selectedContacts)
        if(!contact) return ''

        const title = contact.person_id ? 'Edit person' : 'Create person'

        return (
            <Modal show={showPersonModal} onHide={() => {
                this.setState({showPersonModal: false})
            }}>
                <Modal.Header closeButton><Modal.Title><i className="fa fa-vcard-o"/> {title}</Modal.Title></Modal.Header>
                <Modal.Body>
                    <PersonForm
                        contactId={contact._id}
                        name={contact.name}
                        email={contact.email}
                        onSaved={this.onSavedPerson}
                    />
                </Modal.Body>
            </Modal>
        )
    }

    renderPeopleModal() {
        const {showPeopleModal, selectedContacts} = this.state

        if(!selectedContacts || selectedContacts.length == 0) return ''

        return (
            <Modal bsSize="large" show={showPeopleModal} onHide={() => {
                this.setState({showPeopleModal: false})
            }}>
                <Modal.Header closeButton><Modal.Title><i className="fa fa-vcard-o"/> Add to people</Modal.Title></Modal.Header>
                <Modal.Body>
                    <PeopleForm
                        people={selectedContacts.filter(c => c.person_id==null).map(c => ({name:c.name, email:c.email}))}
                        onSaved={this.onSavedPeople}
                    />
                </Modal.Body>
            </Modal>
        )
    }

    onRemoveContact = (contact) => {

        if (confirm(`Are you sure to remove ${contact.name}?`)) {
            Meteor.call('removeContact', contact._id, (err, res) => {
                if (err) {
                    console.log(err)
                    return warning(err.message)
                }

                const {selectedContacts} = this.state
                selectedContacts.splice(_.findIndex(selectedContacts, {_id:contact._id}), 1)
                this.setState({
                    selectedContacts,
                    removedContact: contact
                })
            })
        }
    }

    onSavedContact = (contact, updating) => {
        this.setState({showContactModal: false})
        if(updating) {
            this.setState({
                updatedContact: contact
            })
        }
    }

    onSavedPerson = (person_id) => {
        this.setState({showPersonModal: false})
    }

    onSavedPeople = () => {
        this.setState({showPeopleModal: false})
    }
}
