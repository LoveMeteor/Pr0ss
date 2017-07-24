import React from 'react'
import Select from 'react-select'
import AccountStore from '/imports/api/nylas/account-store'

export default class AccountSelect extends React.Component {
    static propTypes = {
        onChange: React.PropTypes.func.isRequired,
        account: React.PropTypes.object
    }

    constructor(props) {
        super(props)

        const accounts = AccountStore.accounts()
        this.state = {
            accounts: accounts,
            account: props.account || accounts[0]
        }
    }

    componentDidMount() {
        this.unlisten = AccountStore.listen(this.onAccountStoreChanged)
    }

    componentWillUnmount() {
        this.unlisten()
    }

    onAccountStoreChanged = () => {
        this.setState({accounts: AccountStore.accounts()})
    }

    render() {
        const {accounts, account} = this.state

        const options = accounts.map((a)=>({value:a.emailAddress, label:a.name, _id:a._id}))
        const value = {value:account.emailAddress, label:account.name, _id:account._id}
        return (
            <Select
                className="select-wrap"
                options={options}
                value={value}
                valueRenderer={(item)=>item.value}
                onChange={this.onChange}
                clearable={false}
            />
        )
    }

    onChange = (item) => {
        const account = this.state.accounts.find((a)=>a._id===item._id)
        this.setState({account:account})
        this.props.onChange(account)
    }
}