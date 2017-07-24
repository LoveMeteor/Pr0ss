import React from 'react'
import {Button} from 'react-bootstrap'


export default class CompanyOverview extends React.Component {
    static propTypes = {
        company: React.PropTypes.object,
        onRemoveCompany: React.PropTypes.func,
        onEditCompany: React.PropTypes.func
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
            <div className="company-overview">
                {this.renderToolbar()}
                {this.renderContent()}
            </div>
        )
    }


    renderToolbar() {
        const company = this.props.company

        const disabled = !company
        return (
            <div className="toolbar-panel">
                <div>
                    <Button bsStyle="default" disabled={disabled} onClick={this.onClickEditCompany}><i className="fa fa-edit"/></Button>&nbsp;
                    <Button bsStyle="danger" disabled={disabled} onClick={this.onClickRemoveCompany}><i className="fa fa-trash"/></Button>
                </div>
            </div>
        )
    }

    renderContent() {
        const {company} = this.props

        if (!company) return null
        return (
            <div style={{marginTop:20}}>
                <div className="thumbnail-view">
                    <div className="title">{company.name}</div>
                    <div className="info">
                        <div><label>Website:</label><span>{company.website}</span></div>
                        <div><label>Types:</label><span>{company.types().map(t=>t.name).join(',')}</span></div>
                        <div><label>Phone Number:</label><span>{company.phone_numbers.map((phone)=>`${phone.number}(${phone.type})`).join(', ')}</span></div>
                        <div><label>Addresses:</label><span>{company.addresses.map((address)=>`${address.address}(${address.type})`).join(', ')}</span></div>
                        <div><label>People:</label><span>{company.contacts().map((contact)=>`${contact.name}`).join(', ')}</span></div>
                    </div>
                </div>
            </div>
        )
    }

    onClickEditCompany = () => {
        const company = this.props.company
        this.props.onEditCompany && this.props.onEditCompany(company)
    }

    onClickRemoveCompany = () => {
        const company = this.props.company
        this.props.onRemoveCompany && this.props.onRemoveCompany(company)
    }

}

