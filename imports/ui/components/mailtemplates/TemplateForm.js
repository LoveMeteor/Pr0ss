import React from 'react'
import {Button, Form, FormGroup, FormControl, Col, ControlLabel} from 'react-bootstrap'
import ReactQuill from 'react-quill'
import {warning} from '/imports/api/lib/alerts'


export default class TemplateForm extends React.Component {
    static propTypes = {
        template: React.PropTypes.object,
        onSaved: React.PropTypes.func
    }

    constructor(props) {
        super(props)

        this.state = {
            subject: props.template ? props.template.subject : '',
            body: props.template ? props.template.body : '',
            isDefault: props.template ? props.template.isDefault : false
        }
    }

    render() {
        return (
            <Form horizontal onSubmit={this.onSubmit}>
                <FormGroup controlId="formHorizontalName">
                    <Col sm={2}>
                        Subject
                    </Col>
                    <Col sm={10}>
                        <FormControl type="text" placeholder="Name" value={this.state.subject} onChange={(evt) => this.setState({subject:evt.target.value})}/>
                    </Col>
                </FormGroup>

                <FormGroup controlId="formHorizontalSignature">
                    <Col sm={2}>
                        Body
                    </Col>
                    <Col sm={10}>
                        {this.renderBodyEditor()}
                    </Col>
                </FormGroup>
                <FormGroup controlId="formHorizontalDefault">
                    <Col sm={2}>
                        Default?
                    </Col>
                    <Col sm={10}>
                        <FormControl type="checkbox" checked={this.state.isDefault} onChange={(evt) => this.setState({isDefault:evt.target.checked})}/>
                    </Col>
                </FormGroup>

                <FormGroup>
                    <Col sm={12} style={{textAlign:'right'}}>
                        <Button type="submit" bsStyle="primary">Save</Button>
                    </Col>
                </FormGroup>
                {'* You can use <%template_variable_name%> for templating'}
            </Form>
        )
    }

    renderBodyEditor() {
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
                            value={this.state.body}
                            theme="snow"
                            modules = {modules}
                            formats = {formats}
                            onChange={(text) => this.setState({body:text})}>
                </ReactQuill>
            </div>
        )
    }

    onSubmit = (evt) => {
        evt.preventDefault()

        const data = {subject, body, isDefault} = this.state

        if(this.props.template) {
            Meteor.call('updateTemplate', this.props.template._id, data, (err,res) => {
                if(err) warning(err.message)

                if(this.props.onSaved) this.props.onSaved(res)
            })
        } else {
            Meteor.call('insertTemplate', data, (err,res) => {
                if(err) warning(err.message)
                if(this.props.onSaved) this.props.onSaved(res)
            })
        }
    }
}