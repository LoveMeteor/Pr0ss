import React from 'react'
import NylasUtils from '../../../../api/nylas/nylas-utils'
import ContactStore from '../../../../api/nylas/contact-store'
import Select, {Creatable} from 'react-select'


export default class ParticipantsInputField extends React.Component {
    static propTypes = {
        label: React.PropTypes.string,
        values: React.PropTypes.array,      // Pre selected contacts array
        options: React.PropTypes.array,      // selectable contacts array
        onChange: React.PropTypes.func,
        onlyselect: React.PropTypes.bool
    }

    constructor (props) {
        super(props)

        this.state = {
            values: this._getValuesFromContacts(props.values),
            options: this._getValuesFromContacts(props.options)
        }
    }

    render() {
        const {label, values, options} = this.state

        let select
        if(this.props.onlyselect) {
            select = <Select
                className="select-wrap"
                multi
                options={options}
                value={values}
                valueRenderer={(item) => item.value}
                onChange={this._onChange}
                clearable={true}
                placeholder="Select email address in the list..."
            />
        } else {
            select = <Creatable
                className="select-wrap"
                multi
                options={options}
                value={values}
                valueRenderer={(item) => item.value}
                onChange={this._onChange}
                onInputChange={this._onInputChange}
                clearable={true}
                placeholder="Input email address here..."
            />
        }

        return (
            <div className="input-wrap">
                <label className="participant-label">{this.props.label?`${this.props.label}:`:''}</label>
                { select }
            </div>
        )
    }

    _getValuesFromContacts = (contacts) => {
        if(!contacts) return []

        return contacts.map((c) => ({value: c.email, label: NylasUtils.contactDisplayFullname(c), name: c.name ? c.name : ''}))
    }

    _getContactsFromValues = (values) => values && values.map((item) => ({email:item.value, name:item.name}))

    _onChange = (items) => {
        this.setState({values: items})

        this.props.onChange(this._getContactsFromValues(items))
    }

    _onInputChange = (val) => {
        if(this.timeout) { clearTimeout(this.timeout) }

        this.timeout = setTimeout(() => {
            ContactStore.searchContacts(val, {limit:10}).then((contacts) => {
                this.setState({options: this._getValuesFromContacts(contacts)})
            })
        }, 500)
    }
}