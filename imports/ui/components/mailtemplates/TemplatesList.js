import React from 'react'
import TrackerReact from 'meteor/ultimatejs:tracker-react'
import {Button, Table, InputGroup, FormControl} from 'react-bootstrap'
import MailTemplates from '/imports/api/models/mailtemplates/mailtemplates'


export default class TemplatesList extends TrackerReact(React.Component) {
    static propTypes = {
        onSelectTemplate: React.PropTypes.func,
        onCreateTemplate: React.PropTypes.func,
        selectedTemplate: React.PropTypes.object
    }

    constructor(props) {
        super(props)

        const selectedTemplate = props.selectedTemplate
        this.state = {
            selectedTemplate
        }

    }

    componentDidMount() {
        if(this.props.onSelectTemplate) this.props.onSelectTemplate(this.state.selectedTemplate)
    }

    componentWillUnmount() {

    }

    componentWillReceiveProps(nextProps) {
        const {selectedTemplate} = nextProps

        if(selectedTemplate) {
            this.setState({selectedTemplate})
        }
    }

    render() {

        return (
            <div className="templates-list">
                {Meteor.user().isAdmin() && this.renderToolbar()}

                {this.renderContent()}
            </div>
        )
    }

    renderToolbar() {
        return (
            <div className="toolbar-panel">
                <div style={{flex: 1}}>
                    <Button bsStyle="primary" onClick={() => {
                        this.props.onCreateTemplate()
                    }}><i className="fa fa-plus"/></Button>
                </div>
            </div>
        )
    }

    renderContent() {
        return (
            <div className="content-panel">
                <Table hover>
                    <thead>
                    <tr>
                        <th>#</th>
                        <th>Subject</th>
                        <th>Default</th>
                    </tr>
                    </thead>
                    <tbody>
                    {this.renderRows()}
                    </tbody>
                </Table>
            </div>
        )
    }

    renderRows() {
        const templates = MailTemplates.find().fetch()
        if (!templates || templates.length == 0) return ''

        const {selectedTemplate} = this.state

        return templates.map((template, index) => (
            <tr className={selectedTemplate && selectedTemplate._id === template._id ? 'focused' : ''} key={template._id}
                onClick={() => this.onSelectTemplate(template)}>
                <td>{index + 1}</td>
                <td>{template.subject}</td>
                <td><input type="radio" checked={template.isDefault} onChange={() => this.setTemplateAsDefault(template)}/> </td>
            </tr>
        ))
    }

    setTemplateAsDefault = (template) => {
        if(!Meteor.user().isAdmin()) return
        Meteor.call('updateTemplate', template._id, {isDefault:true}, (err, res) => {
            this.onSelectTemplate(res)
        })
    }
    onSelectTemplate = (template) => {
        this.setState({selectedTemplate: template})
        if (this.props.onSelectTemplate) this.props.onSelectTemplate(template)
    }
}

