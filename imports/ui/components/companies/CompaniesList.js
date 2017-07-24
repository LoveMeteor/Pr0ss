import React from 'react'
import TrackerReact from 'meteor/ultimatejs:tracker-react'
import {Button, Table, InputGroup, FormControl} from 'react-bootstrap'

import {Companies} from '/imports/api/models'
const PAGESIZE = 100

export default class CompaniesList extends TrackerReact(React.Component) {
    static propTypes = {
        onSelectCompany: React.PropTypes.func,
        onCreateCompany: React.PropTypes.func,
        updatedCompany: React.PropTypes.object,
        removedCompany: React.PropTypes.object
    }

    constructor(props) {
        super(props)

        this.companies = []
        this.fullyLoaded = false
        this.state = {
            page: 1,
            keyword: null
        }
    }

    componentDidMount() {

    }

    componentWillUnmount() {

    }

    componentWillReceiveProps(nextProps) {
        const {removedCompany} = nextProps

        if(removedCompany) {
            this.setState({removedCompany:removedCompany})
        }
    }

    loadCompanies() {
        const {keyword, page, removedCompany} = this.state

        let filters = {removed:{$ne:true}}
        if(keyword && keyword.length) {
            const regx = {$regex: keyword, $options: 'i'}
            filters['$or'] = [{email: regx}, {name: regx}]
        }

        const result = Companies.find(filters, {skip:(page-1)*PAGESIZE,limit:PAGESIZE,sort:{name:1}}).fetch()
        if(result.length!=PAGESIZE) this.fullyLoaded = true
        result.forEach((c)=>{
            const index = this.companies.findIndex((c1)=>c1._id==c._id)
            if(index >= 0) {
                this.companies.splice(index, 1, c)
            } else {
                this.companies.push(c)
            }
        })

        if(removedCompany) {
            const index = this.companies.findIndex((c) => c._id == removedCompany._id)

            if(index>-1) this.companies.splice(index, 1)
        }

        return this.companies
    }

    render() {
        return (
            <div className="company-list">
                {this.renderToolbar()}

                {this.renderContent()}
            </div>
        )
    }

    renderToolbar() {
        return (
            <div className="toolbar-panel">
                <div style={{flex: 1}}>
                    <Button bsStyle="primary" onClick={()=>{this.props.onCreateCompany&&this.props.onCreateCompany()}}><i className="fa fa-plus"/></Button>
                </div>
                <div style={{width:250}}>
                    <InputGroup>
                        <InputGroup.Addon><i className="fa fa-search"/></InputGroup.Addon>
                        <FormControl type="text" placeholder="Search..." onChange={this.onChangeSearch} />
                    </InputGroup>
                </div>
            </div>
        )
    }

    renderContent() {
        return (
            <div className="content-panel">
                <Table striped hover>
                    <thead>
                    <tr>
                        <th width="5%">#</th>
                        <th width="20%">Name</th>
                        <th width="15%">Website</th>
                        <th width="10%">Types</th>
                        <th width="20%">Phone Numbers</th>
                        <th width="20%">Addresses</th>
                        <th width="10%">People</th>
                    </tr>
                    </thead>
                    <tbody onScroll={this.onScrollCompanyList}>
                    {this.renderCompanies()}
                    </tbody>
                </Table>
            </div>
        )
    }
    renderCompanies() {
        const {selectedCompany} = this.state

        const companies = this.loadCompanies()
        if (!companies || companies.length == 0) return


        compare = (c1, c2) => {
            if (c1.name > c2.name) return 1
            else if (c1.name < c2.name) return -1
            else {
                if(c1.email > c2.email) return 1
                else if(c1.email < c2.email) return -1
                return 0
            }
        }
        return companies.sort(compare).map((company, index) => (
            <tr className={selectedCompany && selectedCompany._id===company._id ? 'focused' : ''} key={company._id} onClick={() => this.onClickCompany(company)}>
                <td width="5%">{index + 1}</td>
                <td width="20%">{company.name}</td>
                <td width="15%">{company.website}</td>
                <td width="10%">{company.types().map(t=>t.name).join(',')}</td>
                <td width="20%">{company.phone_numbers.map((phone)=>`${phone.number}(${phone.type})`).join(', ')}</td>
                <td width="20%">{company.addresses.map((address)=>`${address.address}(${address.type})`).join(', ')}</td>
                <td width="10%">{company.contacts().length}</td>
            </tr>
        ))
    }

    onClickCompany = (company) => {
        this.setState({selectedCompany: company})
        if(this.props.onSelectCompany) this.props.onSelectCompany(company)
    }

    onScrollCompanyList = (evt) => {
        const el = evt.target

        if (!this.fullyLoaded && el.scrollTop + el.clientHeight == el.scrollHeight) {
            if (this.scrollTimeout) {
                clearTimeout(this.scrollTimeout);
            }

            this.scrollTimeout = setTimeout(() => {
                const page = this.state.page
                this.setState({page:page+1})
            }, 500)

            evt.preventDefault()
        }
    }

    onChangeSearch = (evt) => {
        if(this.searchTimeout) { clearTimeout(this.searchTimeout); }

        const keyword = evt.target.value
        this.searchTimeout = setTimeout(() => {
            this.companies = []
            this.fullyLoaded = false
            this.setState({keyword:keyword,page:1})
        }, 500)
    }
}
