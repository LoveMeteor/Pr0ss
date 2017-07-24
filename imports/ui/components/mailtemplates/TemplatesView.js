import React from 'react'
import {Modal} from 'react-bootstrap'
import TemplatesList from './TemplatesList'
import TemplateOverview from './TemplateOverview'
import TemplateForm from './TemplateForm'
import {warning} from '/imports/api/lib/alerts'


export default class TemplatesView extends React.Component {
    constructor(props) {
        super(props)

        this.state = {
            showTemplateModal: false,
            creating: false,
            selectedTemplate: null
        }
    }

    render() {
        return (
            <div className="templates-panel">
                <TemplatesList
                    onSelectTemplate={(template) => this.setState({selectedTemplate: template})}
                    onCreateTemplate={() => this.setState({showTemplateModal: true, creating:true})}
                    selectedTemplate={this.state.selectedTemplate}
                />
                <TemplateOverview style={{padding:20}}
                    template={this.state.selectedTemplate}
                    showToolbar={Meteor.user().isAdmin()}
                    onRemoveTemplate={this.onRemoveTemplate}
                    onEditTemplate={() => this.setState({showTemplateModal: true, creating:false})}
                />
                {this.renderTemplateModal()}
            </div>
        )
    }

    renderTemplateModal() {
        const {showTemplateModal, selectedTemplate, creating} = this.state
        const title = selectedTemplate&&!creating ? 'Edit Template' : 'Create Template'

        return (
            <Modal show={showTemplateModal} onHide={() => {
                this.setState({showTemplateModal: false})
            }} bsSize="large">
                <Modal.Header closeButton><Modal.Title>{title}</Modal.Title></Modal.Header>
                <Modal.Body>
                    <TemplateForm template={!creating?selectedTemplate:null} onSaved={this.onSavedTemplate}/>
                </Modal.Body>
            </Modal>
        )
    }

    onRemoveTemplate = (template) => {

        if (confirm(`Are you sure to remove ${template.subject}?`)) {
            Meteor.call('removeTemplate', template._id, (err, res) => {
                if (err) {
                    console.log(err)
                    return warning(err.message)
                }

                this.setState({
                    selectedTemplate: null
                })
            })
        }
    }

    onSavedTemplate = (template) => {console.log(template)
        this.setState({
            showTemplateModal: false,
            selectedTemplate: template
        })
    }
}

