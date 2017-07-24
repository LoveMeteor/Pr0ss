import React from 'react'
import {Button} from 'react-bootstrap'
import EmailFrame from '../inbox/EmailFrame'

export default class TemplateOverview extends React.Component {
    static propTypes = {
        template: React.PropTypes.object,
        showToolbar: React.PropTypes.bool,
        onRemoveTemplate: React.PropTypes.func,
        onEditTemplate: React.PropTypes.func
    }

    constructor(props) {
        super(props)

    }

    componentDidMount() {

    }

    componentWillUnmount() {

    }

    render() {
        return (
            <div className="template-overview" style={this.props.style}>
                {this.props.showToolbar && this.renderToolbar()}
                {this.renderContent()}
            </div>
        )
    }


    renderToolbar() {
        const template = this.props.template
        const disabled = !template
        return (
            <div className="toolbar-panel">
                <div>
                    <Button bsStyle="default" disabled={disabled} onClick={this.onClickEdit}><i className="fa fa-edit"/></Button>&nbsp;
                    <Button bsStyle="danger" disabled={disabled} onClick={this.onClickRemove}><i className="fa fa-trash"/></Button>
                </div>
            </div>
        )
    }

    renderContent() {
        const {template} = this.props

        if (!template) return null
        return (
            <div style={{marginTop:20}}>
                <div className="template-view">
                    <div className="subject">{template.subject}</div>
                    <div className="body"><EmailFrame showQuotedText={true} content={template.body}/></div>
                </div>
            </div>
        )
    }

    onClickEdit = () => {
        const template = this.props.template
        this.props.onEditTemplate && this.props.onEditTemplate(template)
    }

    onClickRemove = () => {
        const template = this.props.template
        this.props.onRemoveTemplate && this.props.onRemoveTemplate(template)
    }

}

