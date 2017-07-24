import React from 'react'
import Select from 'react-select'
import {Companies} from '/imports/api/models'

export default class CompanySelect extends React.Component {
    static propTypes = {
        onChange: React.PropTypes.func.isRequired,
        company: React.PropTypes.object,
        companyId: React.PropTypes.string
    }

    constructor(props) {
        super(props)

        const companies = Companies.find({},{sort:{name:1}}).fetch()
        const company = props.company ? props.company : (props.companyId ? companies.find((c)=>c._id===props.companyId) : null)
        this.state = {
            companies: companies,
            company: company
        }
    }

    componentDidMount() {

    }

    componentWillUnmount() {

    }

    render() {
        const {companies, company} = this.state

        const options = companies.map((c)=>({value:c._id, label:c.name}))
        const value = company ? {value:company._id, label:company.name} : null
        return (
            <Select
                className="select-wrap"
                options={options}
                value={value}
                valueRenderer={(item)=>item.label}
                onChange={this.onChange}
                clearable={true}
                placeholder="Selecte a company"
            />
        )
    }

    onChange = (item) => {
        if(!item) {
            this.setState({company:null})
            this.props.onChange(null)
            return
        }
        const company = this.state.companies.find((c)=>c._id===item.value)
        this.setState({company})
        this.props.onChange(company)
    }
}