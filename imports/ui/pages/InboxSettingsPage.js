import React from 'react'
import {Tabs, Tab, PanelGroup, Panel, Button, Col} from 'react-bootstrap'
import AccountStore from '../../api/nylas/account-store'
import Actions from '../../api/nylas/actions'
import AccountSettingForm from '../components/inbox/AccountSettingForm'
import NylasSigninForm from '../components/inbox/NylasSigninForm'
import {warning} from '/imports/api/lib/alerts'
import TemplatesView from '../components/mailtemplates/TemplatesView'

export default class InboxSettingsPage extends React.Component {
    static propTypes = {}

    constructor(props) {
        super(props)

        this.state = {
            addingIndividualInbox: false,
            addingTeamInbox: false,
            accounts: AccountStore.accounts()
        }
    }


    componentDidMount() {
        this.unsubscribes = []
        this.unsubscribes.push(AccountStore.listen(this.onAccountStoreChanged))
    }

    componentWillUnmount() {
        if (this.unsubscribes) {
            this.unsubscribes.forEach((unsubscribe) => {
                unsubscribe()
            })
        }
    }

    onAccountStoreChanged = () => {
        this.setState({accounts: AccountStore.accounts()})
    }

    render() {
        return (
            <div className="inbox-settings-page">
                <Tabs defaultActiveKey={1} id="inbox-settings-tab" style={{height:'100%'}}>
                    <Tab eventKey={1} title="Inboxes" style={{height:'100%'}}>{this.renderInboxesTab()}</Tab>
                    <Tab eventKey={2} title="Templates" style={{height:'100%'}}>{this.renderTemplatesTab()}</Tab>
                </Tabs>
            </div>
        )
    }

    renderInboxesTab() {
        return (
            <PanelGroup style={{height:'100%'}}>
                {Meteor.user().isAdmin() &&
                <Panel header="Team Inboxes" eventKey="1">{this.renderInboxesComponent(true)}</Panel>}
                <Panel header="Individual Inboxes" eventKey="2">{this.renderInboxesComponent()}</Panel>
            </PanelGroup>
        )
    }

    renderInboxesComponent = (isTeamAccount = false) => {
        const accounts = this.state.accounts.filter((account) => account.isTeamAccount == isTeamAccount)

        const {addingIndividualInbox, addingTeamInbox} = this.state
        if (addingIndividualInbox && !isTeamAccount || addingTeamInbox && isTeamAccount) {
            return <NylasSigninForm isAddingTeamInbox={isTeamAccount}
                                    onCancel={() => isTeamAccount ? this.setState({addingTeamInbox: false}) : this.setState({addingIndividualInbox: false})}
                                    onCompleted={() => isTeamAccount ? this.setState({addingTeamInbox: false}) : this.setState({addingIndividualInbox: false})}/>
        } else {
            return (
                <div style={{padding: 10, backgroundColor: 'white'}}>
                    <div className="toolbar-panel">
                        <div style={{flex: 1}}>
                            <Button bsStyle="primary"
                                    onClick={() => isTeamAccount ? this.setState({addingTeamInbox: true}) : this.setState({addingIndividualInbox: true})}>
                                Add an inbox
                            </Button>
                        </div>
                    </div>
                    {
                        accounts.map((account) => {
                            const header = (
                                <div style={{display: 'flex'}}>
                                    <div style={{flex: 1}}>
                                        {account.emailAddress}
                                    </div>
                                    <div>
                                        <Button bsStyle="danger" bsSize="xsmall"
                                                onClick={() => this.onClickRemoveAccount(account)}>
                                            <i className="fa fa-trash"/>
                                        </Button>
                                    </div>
                                </div>
                            )

                            return (
                                <Col md={6} key={account._id}>
                                    <Panel header={header}>
                                        <AccountSettingForm account={account}/>
                                    </Panel>
                                </Col>
                            )
                        })
                    }
                </div>
            )
        }
    }

    onClickRemoveAccount = (account) => {
        if (confirm(`Are you sure to remove ${account.emailAddress}?`)) {
            Meteor.call('removeNylasAccount', account, (err, res) => {
                if (err) {
                    console.log(err)
                    return warning(err.message)
                }

                Actions.changedAccounts()
            })
        }
    }

    renderTemplatesTab() {
        return <TemplatesView/>
    }
}

