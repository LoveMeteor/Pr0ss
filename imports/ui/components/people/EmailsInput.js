import React from 'react'
import {Panel, Button, FormControl} from 'react-bootstrap'
import Select from 'react-select'
import {People} from '/imports/api/models'

const emailTypeOptions = People.EmailTypes.map(t => ({value:t, label:t}))

export default class EmailsInput extends React.Component {
    static propTypes = {
        emails: React.PropTypes.array,
        onChange: React.PropTypes.func
    }

    constructor(props) {
        super(props)

        this.state = {
            emails: props.emails
        }
    }

    onClickAddEmail = () => {
        let {emails} = this.state
        const email = {
            email: '',
            type: '',
            is_default: emails.length==0
        }
        emails.push(email)
        this.setState({emails})

        if(this.props.onChange) this.props.onChange(emails)
    }

    onClickRemoveEmail = (index) => {
        const {emails} = this.state
        emails.splice(index, 1)
        this.setState({emails})

        if(this.props.onChange) this.props.onChange(emails)
    }

    changeState = (obj, key, val) => {
        if (key === 'is_default' && val == true) {
            this.state.emails.forEach((email) => {
                email.is_default = false;
            });
            obj[key] = true;
        } else {
            obj[key] = val;
        }

        this.setState({emails:this.state.emails})

        if(this.props.onChange) this.props.onChange(this.state.emails)
    }

    render() {
        const {emails} = this.state
        const header = (
            <div style={{display: 'flex'}}>
                <div style={{flex: 1}}>Emails</div>
                <div>
                    <Button bsSize="xsmall" onClick={this.onClickAddEmail}>
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
                        <th width="60%">Email</th>
                        <th width="25%">Type</th>
                        <th width="10%">Default</th>
                        <th></th>
                    </tr>
                    </thead>
                    <tbody>
                    {
                        emails.map((email, index)=>(
                            <tr key={index}>
                                <td><FormControl type="email" value={email.email} onChange={(e)=>this.changeState(email, 'email', e.target.value)}/></td>
                                <td><Select clearable={false} options={emailTypeOptions} value={{value:email.type, label:email.type}} onChange={(item)=>this.changeState(email, 'type', item.value)}/></td>
                                <td><input type="checkbox" checked={email.is_default} onChange={(e)=>this.changeState(email, 'is_default', e.target.checked)}/> </td>
                                <td><Button bsSize="xsmall" onClick={()=>this.onClickRemoveEmail(index)}><i className="fa fa-trash"/></Button></td>
                            </tr>
                        ))
                    }
                    </tbody>
                </table>
            </Panel>
        )
    }
}