/* global FlowRouter */
import React from 'react'
import ComposeButton from './composer/ComposeButton'
import ThreadArchiveButton from './ThreadArchiveButton'
import ThreadTrashButton from './ThreadTrashButton'
import ThreadToggleUnreadButton from './ThreadToggleUnreadButton'
import ThreadStarButton from './ThreadStarButton'
import {DropdownButton, MenuItem, FormControl, InputGroup, Button} from 'react-bootstrap'
import {SalesRecords, Threads} from '/imports/api/models'


export default class Toolbar extends React.Component {
    static propTypes = {
        thread: React.PropTypes.object,
        onSelectMenuSalesRecord: React.PropTypes.func
    }

    constructor(props) {
        super(props)


        this.state = {
            salesRecords: SalesRecords.find({}, {sort:{name:1}}).fetch()
        }
    }

    render() {
        const thread = this.props.thread
        return (
            <div className="toolbar-panel">
                <div style={{order: 0, minWidth: 150, maxWidth: 200, flex: 1}}>
                    <ComposeButton/>
                </div>
                <div style={{order: 1, minWidth: 250, maxWidth: 450, flex: 1}}></div>
                <div style={{order: 2, flex: 1}}>
                    <ThreadArchiveButton thread={thread}/>&nbsp;&nbsp;&nbsp;
                    <ThreadTrashButton thread={thread}/>&nbsp;&nbsp;&nbsp;
                    <ThreadToggleUnreadButton thread={thread}/>&nbsp;&nbsp;&nbsp;
                    <ThreadStarButton thread={thread}/>
                    {this.renderSalesRecordMenu()}
                </div>
            </div>
        )
    }

    renderSalesRecordMenu() {
        const {thread} = this.props
        if(!thread) return ''

        const existingThread = Threads.findOne({id: thread.id})
        const salesRecord = existingThread ? SalesRecords.findOne(existingThread.salesRecordId) : null
        if(salesRecord) {
            return (
                <div style={{marginTop:12, float:'right'}}>
                    <DropdownButton bsStyle="default" bsSize="small" title={salesRecord.name} pullRight id="dropdown-sales-record" disabled={!thread}>
                        <MenuItem onSelect={() => this.props.onSelectMenuSalesRecord('goto', {salesRecordId:existingThread.salesRecordId})}>Go to this deal</MenuItem>
                        <MenuItem divider/>
                        <MenuItem onSelect={() => this.props.onSelectMenuSalesRecord('unbind')}>Unbind from this deal</MenuItem>
                    </DropdownButton>
                </div>
            )
        }

        const {salesRecords} = this.state
        return (
            <div style={{marginTop:12, float:'right'}}>
                <DropdownButton bsStyle="default" bsSize="small" title="Deal" pullRight id="dropdown-sales-record" disabled={!thread}>
                    <MenuItem onSelect={() => this.props.onSelectMenuSalesRecord('create')}>Create new Deal from this thread</MenuItem>
                    <MenuItem divider/>
                    <MenuItem header>Bind this thread to existing Deal</MenuItem>
                    <MenuItem header>
                        <InputGroup>
                            <InputGroup.Addon><i className="fa fa-search"/></InputGroup.Addon>
                            <FormControl type="text" placeholder="Search..." onChange={this.onChangeSearchSalesRecord} />
                        </InputGroup>
                    </MenuItem>
                    {
                        salesRecords.map((sr) => <MenuItem key={sr._id} onSelect={() => this.props.onSelectMenuSalesRecord('bind', {salesRecord:sr})}>{sr.name}</MenuItem>)
                    }
                </DropdownButton>
            </div>
        )
    }



    onChangeSearchSalesRecord = (evt) => {
        if(this.searchTimeout) { clearTimeout(this.searchTimeout) }

        const keyword = evt.target.value
        this.searchTimeout = setTimeout(() => {
            if(keyword.length) {
                this.setState({salesRecords: SalesRecords.find({name:{$regex: keyword, $options: 'i'}}, {sort:{name:1}}).fetch()})
            } else {
                this.setState({salesRecords: SalesRecords.find({}, {sort:{name:1}}).fetch()})
            }
        }, 500)
    }
}
