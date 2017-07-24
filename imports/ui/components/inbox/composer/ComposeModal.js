import React from 'react'
import {Modal} from 'react-bootstrap'
import ComposeView from './ComposeView'
import DraftStore from '../../../../api/nylas/draft-store'

export default class ComposeModal extends React.Component {
    static propTypes = {
        clientId: React.PropTypes.string,
        isOpen: React.PropTypes.bool,
        onClose: React.PropTypes.func.isRequired,
        lazySend: React.PropTypes.bool
    }

    constructor(props) {
        super(props)

        this.draft = DraftStore.draftForClientId(props.clientId)
    }

    render() {
        const {isOpen, clientId, onClose, salesRecordId} = this.props
        return (
            <Modal show={isOpen} onHide={onClose} bsSize="large">
                <Modal.Header closeButton><Modal.Title>{this.draft && this.draft.reply_to_message_id ? 'Edit Message' : 'Compose New Mail'}</Modal.Title></Modal.Header>
                <Modal.Body><ComposeView clientId={clientId} lazySend={this.props.lazySend}/></Modal.Body>
            </Modal>
        )
    }
}