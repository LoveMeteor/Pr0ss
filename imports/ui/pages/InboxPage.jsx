/* global FlowRouter */
import React from 'react'
import TrackerReact from 'meteor/ultimatejs:tracker-react'
import {Button, DropdownButton, MenuItem, Modal} from 'react-bootstrap'
import Spinner from '../components/utils/spinner'
import {warning} from '/imports/api/lib/alerts'
import Actions from '../../api/nylas/actions'
import '../../api/nylas/tasks/task-queue'
import NylasUtils from '../../api/nylas/nylas-utils'
import AccountStore from '../../api/nylas/account-store'
import CategoryStore from '../../api/nylas/category-store'
import ThreadStore from '../../api/nylas/thread-store'
import DraftStore from '../../api/nylas/draft-store'
import ItemCategory from '../components/inbox/ItemCategory'
import ItemThread from '../components/inbox/ItemThread'
import MessageList from '../components/inbox/MessageList'
import Toolbar from '../components/inbox/Toolbar'
import ComposeModal from '../components/inbox/composer/ComposeModal'
import NylasSigninForm from '../components/inbox/NylasSigninForm'
import CreateSalesRecord from '../components/salesRecord/CreateSalesRecord'
import PeopleForm from '../components/people/PeopleForm'
import {People} from '/imports/api/models'
import {removeThread} from '/imports/api/models/threads/methods'


class InboxPage extends TrackerReact(React.Component) {
    constructor(props) {
        super(props)

        const currentCategory = CategoryStore.currentCategory
        this.state = {
            addingInbox: false,
            addingTeamInbox: false,
            showSalesRecordModal: false,
            bindingSalesRecord: false,
            loadingThreads: false,
            hasNylasAccounts: NylasUtils.hasNylasAccounts(),
            currentCategory,
            threads: currentCategory ? ThreadStore.getThreads() : [],
            currentThread: currentCategory ? ThreadStore.currentThread(currentCategory) : null
        }


        if (this.state.hasNylasAccounts) {
            Actions.loadContacts()
        }
    }

    componentDidMount() {
        this.unsubscribes = []
        this.unsubscribes.push(AccountStore.listen(this.onAccountStoreChanged))
        this.unsubscribes.push(CategoryStore.listen(this.onCategoryStoreChanged))
        this.unsubscribes.push(ThreadStore.listen(this.onThreadStoreChanged))
        this.unsubscribes.push(DraftStore.listen(this.onDraftStoreChanged))

    }

    componentWillUnmount() {
        this.unsubscribes.forEach((unsubscribe) => {
            unsubscribe()
        })

    }

    onAccountStoreChanged = () => {
        this.setState({
            addingInbox: false,
            addingTeamInbox: false,
            hasNylasAccounts: NylasUtils.hasNylasAccounts()
        })
    }

    onCategoryStoreChanged = () => {
        const currentCategory = CategoryStore.currentCategory
        this.setState({
            currentCategory
        })
    }

    onThreadStoreChanged = () => {
        this.setState({
            threads: ThreadStore.getThreads(),
            loadingThreads: ThreadStore.loading
        })
    }

    onDraftStoreChanged = () => {
        this.setState({
            composeState: DraftStore.draftViewStateForModal()
        })
    }

    render() {
        return (
            <div className="inbox-page">
                {this.renderContents()}
            </div>
        )
    }

    renderContents() {
        const {hasNylasAccounts, composeState, addingInbox, addingTeamInbox} = this.state

        if (addingInbox) {
            return <NylasSigninForm isAddingTeamInbox={addingTeamInbox}
                                    onCancel={() => this.setState({addingInbox: false})}/>
        } else {
            if (hasNylasAccounts) {
                return (
                    <div style={{height: '100%'}}>
                        {this.renderInbox()}
                        {this.renderSalesRecordModal()}
                        {this.renderPeopleModal()}
                        <ComposeModal isOpen={composeState && composeState.show}
                                      clientId={composeState && composeState.clientId}
                                      onClose={this.onCloseComposeModal}/>
                    </div>
                )
            } else {
                return this.renderAddInboxButtons()
            }
        }
    }

    onCloseComposeModal = () => {
        const {composeState} = this.state
        if (!composeState) return

        const draft = DraftStore.draftForClientId(composeState.clientId)

        if (!NylasUtils.isEmptyDraft(draft)) {
            if (confirm('Are you sure to discard?'))
                DraftStore.removeDraftForClientId(draft.clientId)
        } else {
            DraftStore.removeDraftForClientId(draft.clientId)
        }
    }

    renderInbox() {
        return (
            <div style={{display: 'flex', flexDirection: 'column', height: '100%'}}>
                <Toolbar currentUser={this.props.currentUser} thread={this.state.currentThread}
                         onSelectMenuSalesRecord={this.onSelectMenuSalesRecord}/>

                <div className="content-panel">
                    <div className="column-panel" style={{
                        order: 1,
                        minWidth: 250,
                        maxWidth: 250,
                        borderRight: '1px solid rgba(221,221,221,0.6)',
                        paddingRight: 5,
                        overflowY: 'auto',
                        height: '100%'
                    }}>
                        {this.renderCategories()}
                    </div>
                    <div className="column-panel" style={{
                        order: 2,
                        minWidth: 250,
                        maxWidth: 450,
                        borderRight: '1px solid rgba(221,221,221,0.6)',
                        overflowY: 'auto',
                        height: '100%'
                    }} onScroll={this.onScrollThreadList}>

                        {this.renderThreads()}
                    </div>
                    <div className="column-panel" style={{order: 3, flex: 1, overflowY: 'auto', height: '100%'}}>
                        {this.renderMessages()}
                    </div>
                </div>
            </div>
        )
    }

    onSelectMenuSalesRecord = (option, {salesRecord, salesRecordId} = {}) => {
        if (option === 'create' || option === 'bind') {

            this.setState({
                bindingSalesRecord: option == 'bind',
                selectedSalesRecord: salesRecord
            })

            const {participants} = this.state.currentThread
            const noStoredParticipants = participants.filter((p) => People.findOne({'emails.email': p.email}) == null)
            if (noStoredParticipants && noStoredParticipants.length) {
                this.setState({
                    noStoredParticipants,
                    showPeopleModal: true
                })

                return
            }

            this.setState({
                showSalesRecordModal: true
            })
        } else if (option === 'goto') {
            FlowRouter.go('SalesRecord', {id: salesRecordId})
        } else if (option === 'unbind') {
            try {
                removeThread.call({id: this.state.currentThread.id})
            } catch (err) {
                console.error(err)
            }
        }
    }

    renderSalesRecordModal() {
        const {showSalesRecordModal, bindingSalesRecord, currentThread, selectedSalesRecord} = this.state

        if (!currentThread) return ''

        const title = bindingSalesRecord ? 'Bind this thread to existing Deal' : 'Create new Deal from this thread'
        return (
            <Modal show={showSalesRecordModal} onHide={this.onCloseSalesRecordModal} bsSize="large">
                <Modal.Header closeButton>
                    <Modal.Title>{title}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <CreateSalesRecord
                        {...this.props}
                        thread={currentThread}
                        salesRecord={selectedSalesRecord}
                    />
                </Modal.Body>
            </Modal>
        )
    }

    renderPeopleModal() {
        const {showPeopleModal, noStoredParticipants} = this.state

        if (!noStoredParticipants || noStoredParticipants.length == 0) return ''

        return (
            <Modal bsSize="large" show={showPeopleModal} onHide={() => {
                this.setState({showPeopleModal: false})
            }}>
                <Modal.Header closeButton><Modal.Title><i className="fa fa-vcard-o"/> Add to
                    people</Modal.Title></Modal.Header>
                <Modal.Body>
                    <PeopleForm
                        people={noStoredParticipants}
                        onSaved={this.onSavedPeople}
                    />
                </Modal.Body>
            </Modal>
        )
    }

    onSavedPeople = () => {
        this.setState({
            showPeopleModal: false
        }, () => {
            this.setState({showSalesRecordModal: true})
        })
    }
    onCloseSalesRecordModal = () => {
        this.setState({
            showSalesRecordModal: false,
            bindingSalesRecord: false
        })
    }

    renderCategories() {
        const {currentCategory} = this.state

        return (
            <div className="list-category">
                {this.renderAddInboxButtons(true)}
                {
                    AccountStore.accounts().map((account) => {
                        const categoriesForAccount = CategoryStore.getCategories(account.accountId)

                        const actionEl = !account.isTeamAccount || account.isTeamAccount && Meteor.user().isAdmin() ? <i className="fa fa-minus" onClick={() => this.onClickRemoveAccount(account)}></i> : ''
                        return (
                            <div key={`account-${account.accountId}`}>
                                <div className="account-wrapper">
                                    <span><img src={account.isTeamAccount ? '/icons/inbox/ic-team.png' : '/icons/inbox/ic-individual.png'} width="16px"/></span>&nbsp;
                                    <span>{account.emailAddress}</span>
                                    <span style={{flex: 1}}></span>
                                    <span className="action">{actionEl}</span>
                                </div>
                                {
                                    categoriesForAccount && categoriesForAccount.length > 0 && categoriesForAccount.map((category) => {
                                        if (category) {
                                            return <ItemCategory
                                                key={`category-${category.id}`}
                                                category={category}
                                                onClick={(evt) => {
                                                    this.onCategorySelected(category)
                                                }}
                                                selected={currentCategory && category.id == currentCategory.id}
                                            />
                                        } else {
                                            return <div></div>
                                        }
                                    })
                                }
                            </div>
                        )

                    })
                }
            </div>
        )
    }

    renderAddInboxButtons(isSmall) {
        if (isSmall) {
            if (Meteor.user().isAdmin()) {
                return (
                    <div>
                        <DropdownButton bsStyle="primary" bsSize="small" title="Add inbox" id="dropdown-add-inbox">
                            <MenuItem onSelect={() => this.setState({addingInbox: true, addingTeamInbox: false})}>Individual</MenuItem>
                            <MenuItem onSelect={() => this.setState({
                                addingInbox: true,
                                addingTeamInbox: true
                            })}>Team</MenuItem>
                        </DropdownButton>
                    </div>
                )
            } else {
                return (
                    <div>
                        <Button bsStyle="primary" bsSize="small"
                                onClick={() => this.setState({addingInbox: true, addingTeamInbox: false})}>Add
                            inbox</Button>
                    </div>
                )
            }
        } else {
            return (
                <div style={{textAlign: 'center'}}>
                    <Button bsStyle="primary" onClick={() => this.setState({addingInbox: true})}>Add an individual
                        inbox</Button>
                    {Meteor.user().isAdmin() &&
                    <Button bsStyle="default" style={{marginLeft: 10}}
                            onClick={() => this.setState({addingInbox: true, addingTeamInbox: true})}>Add a team
                        inbox</Button>}
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

    renderThreads() {
        const {threads, currentThread, loadingThreads} = this.state

        return (
            <div className="list-thread">
                {
                    threads.map((thread) => <ItemThread key={`thread-${thread.id}`} thread={thread}
                                                        onClick={(evt) => this.onThreadSelected(thread)}
                                                        selected={currentThread && thread.id == currentThread.id}/>)

                }
                {loadingThreads &&
                <div style={{position: 'relative', height: 44, width: '100%'}}><Spinner visible={true}/></div>}
            </div>
        )
    }

    renderMessages() {
        return <MessageList />
    }

    onCategorySelected(category) {
        CategoryStore.selectCategory(category)
        this.setState({currentThread: ThreadStore.currentThread(category)})
    }

    onThreadSelected(thread) {
        this.setState({currentThread: thread})

        ThreadStore.selectThread(thread)
    }

    onScrollThreadList = (evt) => {
        const el = evt.target

        if (!this.state.loadingThreads && !ThreadStore.fullyLoaded && el.scrollTop + el.clientHeight == el.scrollHeight) {
            Actions.loadThreads(CategoryStore.currentCategory, {page: ThreadStore.currentPage + 1})
        }
    }
}

export default InboxPage
