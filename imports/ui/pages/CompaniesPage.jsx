import React from 'react'
import {Modal} from 'react-bootstrap'
import {removeCompany} from '/imports/api/models/companies/methods'
import CompaniesList from '../components/companies/CompaniesList'
import CompanyOverview from '../components/companies/CompanyOverview'
import CompanyForm from '../components/companies/CompanyForm'
import {warning} from '/imports/api/lib/alerts'


export default class CompaniesPage extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            showCompanyModal: false,
            creating: false,
            selectedCompany: null,
            updatedCompany: null,
            removedCompany: null
        }
    }

    render() {
        return (
            <div className="company-page">
                <CompaniesList
                    onSelectCompany={(company) => this.setState({selectedCompany: company})}
                    onCreateCompany={() => this.setState({showCompanyModal: true, creating:true})}
                    updatedCompany={this.state.updatedCompany}
                    removedCompany={this.state.removedCompany}
                />
                <CompanyOverview
                    company={this.state.selectedCompany}
                    onRemoveCompany={this.onRemoveCompany}
                    onEditCompany={() => this.setState({showCompanyModal: true, creating:false})}
                />
                {this.renderCompanyModal()}
            </div>
        )
    }

    renderCompanyModal() {
        const {showCompanyModal, selectedCompany, creating} = this.state
        const title = selectedCompany&&!creating ? 'Edit Company' : 'Create Company'

        return (
            <Modal show={showCompanyModal} bsSize="large" onHide={() => {
                this.setState({showCompanyModal: false})
            }}>
                <Modal.Header closeButton><Modal.Title><i className="fa fa-building-o"/>&nbsp;{title}</Modal.Title></Modal.Header>
                <Modal.Body>
                    <CompanyForm
                        company={!creating?selectedCompany:null}
                        onSaved={this.onSavedCompany}
                        toggleLoader={this.props.toggleLoader}
                    />
                </Modal.Body>
            </Modal>
        )
    }

    onRemoveCompany = (company) => {

        if (confirm(`Are you sure to remove ${company.name}?`)) {
            try {
                const _id = company._id
                removeCompany.call({_id})

                this.setState({
                    selectedCompany: null,
                    removedCompany: company
                })
            } catch(e) {
                console.log(e)
                return warning(e.message);
            }
        }
    }

    onSavedCompany = (company, updating) => {
        this.setState({showCompanyModal: false})
        if(updating) {
            this.setState({
                updatedCompany: company,
                selectedCompany: company
            })
        }
    }
}
