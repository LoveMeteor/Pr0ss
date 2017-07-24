import React, {PropTypes} from 'react'
import {Modal, Form, FormGroup, Alert, Button, Col} from 'react-bootstrap'
import ParticipantsSelector from './ParticipantsSelector'

export default class ParticipantsSelectModal extends React.Component {
    static propTypes = {
        show: PropTypes.bool,
        onHide: PropTypes.func,
        participants: PropTypes.array,
        selections: PropTypes.array,
        onUpdateParticipants: PropTypes.func
    }

    constructor(props) {
        super(props)

        this.state = {
            show: props.show,
            participants: props.participants || [],
            selections: props.selections || [],
            error: null
        }
    }

    componentWillReceiveProps(newProps) {
        if(newProps !== this.props) {
            this.setState({
                show: newProps.show,
                selections: newProps.selections,
            })
        }
    }

    onChangeParticipants = (participants) => {
        this.setState({selections: participants})
    }

    onSubmit = (evt) => {
        evt.preventDefault()

        const {selections} = this.state
        if(!selections || selections.length == 0) {return this.setState({error:'Should select at least one participant'})}

        if(this.props.onUpdateParticipants) this.props.onUpdateParticipants(selections)
    }

    render() {

        const {show, participants, selections, error} = this.state

        return (
            <Modal show={show} onHide={() => this.props.onHide()} bsSize="large">
                <Modal.Header closeButton><Modal.Title>Select participants</Modal.Title></Modal.Header>
                <Modal.Body>
                    <Form onSubmit={this.onSubmit} horizontal>
                        {error && <Alert bsStyle='danger'>
                            {error}
                        </Alert>}
                        <ParticipantsSelector participants={participants} selections={selections}
                                              onChange={this.onChangeParticipants}/>

                        <FormGroup>
                            <Col sm={12} style={{textAlign: 'right'}}>
                                <Button type="submit" bsStyle="primary">Save</Button>
                            </Col>
                        </FormGroup>
                    </Form>
                </Modal.Body>
            </Modal>
        )
    }

}