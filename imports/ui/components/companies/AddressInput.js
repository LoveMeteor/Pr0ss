import React from 'react'
import {Panel, Button, FormControl} from 'react-bootstrap'

export default class AddressInput extends React.Component {
    static propTypes = {
        addresses: React.PropTypes.array,
        onChange: React.PropTypes.func
    }

    constructor(props) {
        super(props)

        this.state = {
            addresses: props.addresses
        }
    }

    onClickAddAddress = () => {
        const {addresses} = this.state
        const address = {
            address: '',
            type: '',
            is_default: addresses.length==0,
            is_billing: false,
            is_mail: false
        }
        addresses.push(address)
        this.setState({addresses})

        if(this.props.onChange) this.props.onChange(addresses)
    }

    onClickRemoveAddress = (index) => {
        const {addresses} = this.state
        addresses.splice(index, 1)
        this.setState({addresses})

        if(this.props.onChange) this.props.onChange(addresses)
    }

    changeState = (obj, key, val) => {
        if (key === 'is_default' && val == true) {
            this.state.addresses.forEach((address) => {
                address.is_default = false;
            });
            obj[key] = true;
        } else {
            obj[key] = val;
        }

        this.setState({addresses:this.state.addresses})

        if(this.props.onChange) this.props.onChange(this.state.addresses)
    }

    render() {
        const {addresses} = this.state
        const header = (
            <div style={{display: 'flex'}}>
                <div style={{flex: 1}}>Addresses</div>
                <div>
                    <Button bsSize="xsmall" onClick={this.onClickAddAddress}><i className="fa fa-plus"/></Button>
                </div>
            </div>
        )

        return (
            <Panel header={header}>
                <table className='table table-condensed'>
                    <thead>
                    <tr>
                        <th width="50%">Address</th>
                        <th width="15%">Type</th>
                        <th width="10%">Default</th>
                        <th width="10%">Billing</th>
                        <th width="10%">Mail</th>
                        <th></th>
                    </tr>
                    </thead>
                    <tbody>
                    {
                        addresses.map((address, index)=>(
                            <tr key={index}>
                                <td><FormControl type="text" value={address.address} onChange={(e)=>this.changeState(address, 'address', e.target.value)}/></td>
                                <td><FormControl type="text" value={address.type} onChange={(e)=>this.changeState(address, 'type', e.target.value)}/></td>
                                <td><input type="checkbox" checked={address.is_default} onChange={(e)=>this.changeState(address, 'is_default', e.target.checked)}/> </td>
                                <td><input type="checkbox" checked={address.is_billing} onChange={(e)=>this.changeState(address, 'is_billing', e.target.checked)}/> </td>
                                <td><input type="checkbox" checked={address.is_mail} onChange={(e)=>this.changeState(address, 'is_mail', e.target.checked)}/> </td>
                                <td><Button bsSize="xsmall" onClick={()=>this.onClickRemoveAddress(index)}><i className="fa fa-trash"/></Button></td>
                            </tr>
                        ))
                    }
                    </tbody>
                </table>
            </Panel>
        )
    }
}