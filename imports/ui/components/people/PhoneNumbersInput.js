import React from 'react'
import {Panel, Button, FormControl} from 'react-bootstrap'
import Select from 'react-select'
import {People} from '/imports/api/models'

const phoneNumberTypeOptions = People.PhoneNumberTypes.map(t => ({value:t, label:t}))

export default class PhoneNumbersInput extends React.Component {
    static propTypes = {
        phoneNumbers: React.PropTypes.array,
        onChange: React.PropTypes.func
    }

    constructor(props) {
        super(props)

        this.state = {
            phoneNumbers: props.phoneNumbers
        }
    }

    onClickAddPhoneNumber = () => {
        let {phoneNumbers} = this.state
        const phoneNumber = {
            number: '',
            extension: '',
            type: '',
            is_default: phoneNumbers.length==0
        }
        phoneNumbers.push(phoneNumber)
        this.setState({phoneNumbers})

        if(this.props.onChange) this.props.onChange(phoneNumbers)
    }

    onClickRemovePhoneNumber = (index) => {
        const {phoneNumbers} = this.state
        phoneNumbers.splice(index, 1)
        this.setState({phoneNumbers})

        if(this.props.onChange) this.props.onChange(phoneNumbers)
    }

    changeState = (obj, key, val) => {
        if (key === 'is_default' && val == true) {
            this.state.phoneNumbers.forEach((phoneNumber) => {
                phoneNumber.is_default = false;
            });
            obj[key] = true;
        } else {
            obj[key] = val;
        }

        this.setState({phoneNumbers:this.state.phoneNumbers})

        if(this.props.onChange) this.props.onChange(this.state.phoneNumbers)
    }

    render() {
        const {phoneNumbers} = this.state
        const header = (
            <div style={{display: 'flex'}}>
                <div style={{flex: 1}}>Phone numbers</div>
                <div>
                    <Button bsSize="xsmall" onClick={this.onClickAddPhoneNumber}>
                        <i className="fa fa-plus"/>
                    </Button>
                </div>
            </div>
        )

        return (
            <Panel header={header}>
                <table className='table table-condensed'>
                    <thead>
                    <tr>
                        <th width="40%">Number</th>
                        <th width="20%">Extension</th>
                        <th width="25%">Type</th>
                        <th width="10%">Default</th>
                        <th></th>
                    </tr>
                    </thead>
                    <tbody>
                    {
                        phoneNumbers.map((phoneNumber, index)=>(
                            <tr key={index}>
                                <td><FormControl type="text" value={phoneNumber.number} onChange={(e)=>this.changeState(phoneNumber, 'number', e.target.value)}/></td>
                                <td><FormControl type="text" value={phoneNumber.extension} onChange={(e)=>this.changeState(phoneNumber, 'extension', e.target.value)}/></td>
                                <td><Select clearable={false} options={phoneNumberTypeOptions} value={{value:phoneNumber.type, label:phoneNumber.type}} onChange={(item)=>this.changeState(phoneNumber, 'type', item.value)}/></td>
                                <td><input type="checkbox" checked={phoneNumber.is_default} onChange={(e)=>this.changeState(phoneNumber, 'is_default', e.target.checked)}/> </td>
                                <td><Button bsSize="xsmall" onClick={()=>this.onClickRemovePhoneNumber(index)}><i className="fa fa-trash"/></Button></td>
                            </tr>
                        ))
                    }
                    </tbody>
                </table>
            </Panel>
        )
    }
}