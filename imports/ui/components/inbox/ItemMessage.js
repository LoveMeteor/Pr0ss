import _ from 'underscore'
import React from 'react'
import classNames from 'classnames'
import Actions from '../../../api/nylas/actions'
import NylasUtils from '../../../api/nylas/nylas-utils'
import ItemMessageBody from './ItemMessageBody'
import MessageParticipants from './MessageParticipants'
import MessageTimestamp from './MessageTimestamp'
import MessageControls from './MessageControls'
import AttachmentComponent from '../attachment/attachment-component'
import ImageAttachmentComponent from '../attachment/image-attachment-component'
import FileDownloadStore from '../../../api/nylas/file-download-store'

class ItemMessage extends React.Component {

    constructor(props) {
        super(props)

        this.state = {
            detailedHeaders: false,
            downloads: FileDownloadStore.downloadDataForFiles(_.pluck(props.message.files, 'id'))
        }

    }

    componentDidMount() {
        this._unlisten = FileDownloadStore.listen(this._onDownloadStoreChanged)
    }

    componentWillUnmount() {
        if(this._unlisten) this._unlisten()
    }

    render() {
        if (this.props.collapsed) {
            return this.renderCollapsed()
        } else {
            return this.renderFull()
        }
    }

    renderCollapsed() {
        let attachmentIcon = []
        if (this.props.message.files.length > 0) {
            attachmentIcon = <div className="collapsed-attachment"></div>
        }

        const displayName = this.props.message.from && this.props.message.from.length ? NylasUtils.contactDisplayName(this.props.message.from[0]) : ''
        return (
            <div className={this.props.className} onClick={this._toggleCollapsed}>
                <div className="message-item-white-wrap">
                    <div className="message-item-area">
                        <div className="collapsed-from">
                            {displayName}
                        </div>
                        <div className="collapsed-snippet">
                            {this.props.message.snippet}
                        </div>
                        <div className="collapsed-timestamp">
                            <MessageTimestamp date={this.props.message.date}/>
                        </div>
                        {attachmentIcon}
                    </div>
                </div>
            </div>
        )
    }

    renderFull() {
        return (
            <div className={this.props.className}>
                <div className="message-item-white-wrap">
                    <div className="message-item-area">
                        {this.renderHeader()}
                        <ItemMessageBody message={this.props.message} downloads={this.state.downloads}/>
                        {this.renderAttachments()}
                    </div>
                </div>
            </div>
        )
    }

    renderHeader() {
        const classes = classNames({
            'message-header': true,
            'pending': this.props.pending
        })
        return (
            <header className={classes} onClick={this._onClickHeader}>
                {this.renderHeaderSideItems()}
                <div className="message-header-right">
                    <MessageTimestamp className="message-time"
                                      isDetailed={this.state.detailedHeaders}
                                      date={this.props.message.date}/>

                    <MessageControls message={this.props.message} salesRecordId={this.props.salesRecordId} conversationId={this.props.conversationId}/>
                </div>
                {this.renderFromParticipants()}
                {this.renderToParticipants()}
                {this.renderFolder()}
                {this.renderHeaderDetailToggle()}
            </header>
        )
    }

    renderHeaderSideItems() {
        const styles = {
            position: 'absolute',
            marginTop: -2
        }
        return (
            <div className="pending-spinner" style={styles}>
                <img src="/icons/inbox/sending-spinner.gif" />
            </div>
        )
    }

    renderFromParticipants() {
        return (
            <MessageParticipants
                from={this.props.message.from}
                onClick={this._onClickParticipants}
                isDetailed={this.state.detailedHeaders}/>
        )
    }

    renderToParticipants() {
        return (
            <MessageParticipants
                to={this.props.message.to}
                cc={this.props.message.cc}
                bcc={this.props.message.bcc}
                onClick={this._onClickParticipants}
                isDetailed={this.state.detailedHeaders}/>
        )
    }

    renderFolder() {
        if (!this.state.detailedHeaders) return []

        if (!NylasUtils.usesFolders(this.props.message.account_id)) return

        const folder = this.props.message.folder

        if (!folder) return


        return (
            <div className="header-row">
                <div className="header-label">Folder:&nbsp;</div>
                <div className="header-name">{folder.display_name}</div>
            </div>
        )
    }

    renderHeaderDetailToggle() {
        if (this.props.pending) return null

        if (this.state.detailedHeaders)
            return (
                <div className="header-toggle-control"
                     style={{top: '18px', left: '-14px'}}
                     onClick={ (e) => {
                         this.setState({detailedHeaders: false})
                         e.stopPropagation()
                     }}>
                    <img src="/icons/inbox/message-disclosure-triangle-active.png" style={{width: '50%'}}/>
                </div>
            )
        else
            return (
                <div className="header-toggle-control inactive"
                     style={{top: '18px'}}
                     onClick={ (e) => {
                         this.setState({detailedHeaders: true})
                         e.stopPropagation()
                     }}>
                    <img src="/icons/inbox/message-disclosure-triangle.png" style={{width: '50%'}}/>
                </div>
            )
    }

    renderAttachments() {
        const attachments = this._attachmentComponents()

        if(attachments.length>0) {
            return (
                <div>
                    {(attachments.length>1) && this._renderDownloadAllButton()}
                    <div className="attachments-area">{attachments}</div>
                </div>
            )
        } else {
            return <div/>
        }
    }

    _attachmentComponents() {
        let imageAttachments = []
        let otherAttachments = []

        for(const file of this.props.message.files||[]) {
            if(!this._isRealFile(file)) continue

            if(NylasUtils.shouldDisplayAsImage(file))
                imageAttachments.push(file)
            else
                otherAttachments.push(file)
        }

        otherAttachments = otherAttachments.map((file) => (
            <AttachmentComponent
                key={file.id}
                className="file-wrap"
                file={_.extend(file, {account_id:this.props.message.account_id})}
                download={this.state.downloads[file.id]}
            />
        ))

        imageAttachments = imageAttachments.map((file) => (
            <ImageAttachmentComponent
                key={file.id}
                className="file-wrap file-image-wrap"
                file={_.extend(file, {account_id:this.props.message.account_id})}
                download={this.state.downloads[file.id]}
            />
        ))


        return otherAttachments.concat(imageAttachments)
    }

    _isRealFile(file) {
        return !(file.content_id && this.props.message.body && this.props.message.body.indexOf(file.content_id) > 0)
    }

    _renderDownloadAllButton = () => (
            <div className="download-all">
                <div className="attachment-number">
                    <img
                        src="/icons/attachments/ic-attachments-all-clippy.png"
                    />
                    <span>{this.props.message.files.length} attachments</span>
                </div>
            </div>
        )

    _onDownloadAll = () => {
        Actions.downloadFiles(this.props.message.files)
    }

    _onClickParticipants = (e) => {
        let el = e.target
        while (el != e.currentTarget) {
            if (el.classList.contains('collapsed-participants')) {
                this.setState({detailedHeaders: true})

                e.stopPropagation()
                return
            }
            el = el.parentElement
        }
        return
    }

    _onClickHeader = (e) => {

        if (this.state.detailedHeaders) return

        let el = e.target
        while (el !== e.currentTarget) {
            const wl = ['message-header-right',
                'collapsed-participants',
                'header-toggle-control']
            if (el.classList.contains('message-header-right')) return
            if (el.classList.contains('collapsed-participants')) return

            el = el.parentElement
        }

        this._toggleCollapsed()
    }

    _toggleCollapsed = () => {
        if (this.props.isLastMsg) return
        Actions.toggleMessageExpanded(this.props.message.id)
    }


    _onDownloadStoreChanged = () => {
        this.setState({downloads: FileDownloadStore.downloadDataForFiles(_.pluck(this.props.message.files, 'id'))})
    }
}

export default ItemMessage
