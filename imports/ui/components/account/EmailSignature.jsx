import React from 'react'
import Alert from 'react-s-alert'
import {Button, Form, FormGroup, FormControl, Col, ControlLabel} from 'react-bootstrap'
import ReactQuill from 'react-quill'
import {warning} from '/imports/api/lib/alerts'



class EmailSignature extends React.Component{
    constructor(props){
        super(props)
        const user = Meteor.user()
        this.state = {
            signature: user.profile.signature ? user.profile.signature : '',
            blocking: false
        }
    }

    render() {
        return (
            <Form horizontal onSubmit={this.onSubmitUpdate}>
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

        const { signature } = this.state
        const self = this
        function updateUserCustomFieldCb(err){
            self.setState({blocking: false})
            if(err)  {
                Alert.warning('Cannot update signature, try again!', {
                    position: 'bottom-right',
                    effect: 'bouncyflip',
                    timeout: 5000
                })
            }else{
                Alert.info('Signature successful updated!', {
                    position: 'bottom-right',
                    effect: 'bouncyflip',
                    timeout: 3500
                })
            }
        }
        if(signature){
            Meteor.call('updateUserProfileField', 'signature', signature, updateUserCustomFieldCb)
        }
    }


}

export default  EmailSignature
