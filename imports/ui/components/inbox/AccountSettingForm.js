import React from 'react'
import {Button, Form, FormGroup, FormControl, Col, ControlLabel} from 'react-bootstrap'
import ReactQuill from 'react-quill'
import {warning} from '/imports/api/lib/alerts'

export default class AccountSettingForm extends React.Component {
    static propTypes = {
        account: React.PropTypes.object.isRequired
    }

    constructor(props) {
        super(props)

        this.state = {
            name: props.account.name,
            signature: props.account.signature
        }
    }

    render() {
        return (
            <Form horizontal onSubmit={this.onSubmitUpdate}>
                <FormGroup controlId="formHorizontalName">
                    <Col sm={3}>
                        Full Name
                    </Col>
                    <Col sm={9}>
                        <FormControl type="text" placeholder="Name" value={this.state.name} onChange={(evt) => this.setState({name:evt.target.value})}/>
                    </Col>
                </FormGroup>

                <FormGroup controlId="formHorizontalSignature">
                    <Col sm={12}>
                        {this.renderSignatureEditor()}
                    </Col>
                </FormGroup>

                <FormGroup>
                    <Col sm={12} style={{textAlign:'right'}}>
                        <Button type="submit" bsStyle="primary">Update</Button>
                    </Col>
                </FormGroup>
            </Form>
        )
    }

    renderSignatureEditor() {
        const modules = {
            toolbar: [
                [{ 'header': [1, 2, false] }],
                ['bold', 'italic', 'underline','strike', 'blockquote'],
                [{'list': 'ordered'}, {'list': 'bullet'}, {'indent': '-1'}, {'indent': '+1'}],
                ['link', 'image'],
                ['clean']
            ],
        }

        const formats = [
            'header',
            'bold', 'italic', 'underline', 'strike', 'blockquote',
            'list', 'bullet', 'indent',
            'link', 'image'
        ]
        return (
            <div>
                <ReactQuill placeholder="Write here..."
                            value={this.state.signature}
                            theme="snow"
                            modules = {modules}
                            formats = {formats}
                            onChange={(text) => this.setState({signature:text})}>
                </ReactQuill>
            </div>
        )
    }

    onSubmitUpdate = (evt) => {
        evt.preventDefault()

        const {name, signature} = this.state
        Meteor.call('updateNylasAccount', this.props.account._id, {name, signature}, (err,res) => {
            if(err) warning(err.message)
        })
    }
}