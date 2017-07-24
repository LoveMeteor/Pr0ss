import _ from 'underscore'
import React from 'react'
import {FormControl, Button} from 'react-bootstrap'
import ReactQuill from 'react-quill'
import SendActionButton from './SendActionButton'
import AttachActionButton from './AttachActionButton'
import AccountSelect from './AccountSelect'
import NylasUtils from '../../../../api/nylas/nylas-utils'
import AccountStore from '../../../../api/nylas/account-store'
import DraftStore from '../../../../api/nylas/draft-store'
import FileUploadStore from '../../../../api/nylas/file-upload-store'
import FileDownloadStore from '../../../../api/nylas/file-download-store'
import {SalesRecords, Conversations} from '/imports/api/models'
import TemplateSelect from '../../mailtemplates/TemplateSelect'
import EmailFrame from '../EmailFrame'
import AttachmentComponent from '../../attachment/attachment-component'
import ImageAttachmentComponent from '../../attachment/image-attachment-component'
import FileUpload from './FileUpload'
import ImageFileUpload from './ImageFileUpload'
import ParticipantsInputField from './ParticipantsInputField'


export default class ComposeView extends React.Component {
    static propTypes = {
        clientId: React.PropTypes.string,
        lazySend: React.PropTypes.bool
    }

    constructor(props) {
        super(props)

        const draft = this._getDraftFromStore()
        this.state = {
            draft,
            expandedCc: draft.cc && draft.cc.length ? true : false,
            expandedBcc: draft.bcc && draft.bcc.length ? true : false,
            downloads: FileDownloadStore.downloadDataForFiles(_.pluck(draft.downloads, 'id'))
        }
    }

    componentDidMount() {
        this.unsubscribes = []

        this.unsubscribes.push(DraftStore.listen(this._onChangeDraftStore))
    }

    componentWillUnmount() {
        this.unsubscribes.forEach((unsubscribe) => {
            unsubscribe()
        })
    }

    shouldComponentUpdate(nextProps, nextState) {
        return nextProps.clientId!=null && nextState.draft!=null && nextState!==this.state
    }

    _onChangeDraftStore = () => {
        const draft = this._getDraftFromStore()
        if(draft && draft !== this.state.draft)
            this.setState({draft: this._getDraftFromStore()})
    }

    _getDraftFromStore() {
        const draft = _.clone(DraftStore.draftForClientId(this.props.clientId))


        return draft
    }


    _changeDraftStore(data = {}) {
        DraftStore.changeDraftForClientId(this.props.clientId, data)
    }

    render() {
        return (
            <div className="composer-inner-wrap">
                {this._renderHeader()}
                {this._renderBody()}
                {this._renderActions()}
            </div>
        )
    }

    _renderHeader() {
        const {draft, expandedCc, expandedBcc} = this.state

        const {from, to, cc, bcc, subject} = draft

        let contactOptions = [], onlyselect = false
        if (draft.salesRecordId) {
            const salesRecord = SalesRecords.findOne({_id: draft.salesRecordId})
            contactOptions = salesRecord.contactsForStakeholders()
            onlyselect = true
        } else if (draft.conversationId) {
            const conversation = Conversations.findOne({_id: draft.conversationId})
            contactOptions = conversation.contacts()
            onlyselect = true
        }

        const ccSelector = (
            <ParticipantsInputField label="Cc" onlyselect={onlyselect} options={contactOptions} values={cc}
                                    onChange={this._onChangeCc}/>
        )

        const bccSelector = (
            <ParticipantsInputField label="Bcc" onlyselect={onlyselect} options={contactOptions} values={bcc}
                                    onChange={this._onChangeBcc}/>
        )

        const accounts = AccountStore.accounts()
        let fromSelector
        if (accounts.length > 1) {
            const account = AccountStore.accountForAccountId(draft.account_id)
            fromSelector = <AccountSelect onChange={this._onChangeFrom} account={account}/>
        } else {
            fromSelector = <span style={{padding: '5px 10px'}}>{from[0].email}</span>
        }
        return (
            <div>
                <div className="input-wrap">
                    <label className="participant-label">From:</label>{fromSelector}
                    &nbsp;&nbsp;<TemplateSelect onChange={this._onChangeTemplate}/>

                </div>
                <div className="input-wrap">
                    <ParticipantsInputField label="To" onlyselect={onlyselect} options={contactOptions} values={to}
                                            onChange={this._onChangeTo}/>
                    <div className="composer-header-actions">
                        {!expandedCc && <div className="action" onClick={this._onClickCc}>Cc</div>}
                        {!expandedBcc && <div className="action" onClick={this._onClickBcc}>Bcc</div>}
                    </div>
                </div>

                {expandedCc && ccSelector}
                {expandedBcc && bccSelector}

                <div className="input-wrap">
                    <FormControl type="text" value={subject} placeholder="Subject" onChange={this._onChangeSubject}/>
                </div>
            </div>
        )
    }

    _renderBody() {
        return (
            <div>
                {this._renderEditor()}
                {this._renderAttachments()}
                {this._renderSignature()}
            </div>
        )
    }

    _renderEditor() {
        const modules = {
            toolbar: [
                [{'header': [1, 2, false]}],
                ['bold', 'italic', 'underline', 'strike', 'blockquote'],
                [{'list': 'ordered'}, {'list': 'bullet'}, {'indent': '-1'}, {'indent': '+1'}],
                ['link', 'image'],
                ['clean']
            ],
        }

        const formats = [
            'header',
            'bold', 'italic', 'underline', 'strike', 'blockquote',
            'list', 'bullet', 'indent',
            'link', 'image'
        ]

        return (
            <div style={{marginBottom:40}}>
                <ReactQuill placeholder="Write here..."
                            value={this.state.draft.body}
                            theme="bubble"
                            modules={modules}
                            formats={formats}
                            onChange={this._onChangeBody}/>
            </div>
        )
    }

    _renderAttachments() {
        return (
            <div className="attachments-area">
                {this._renderFileAttachments()}
                {/*{this._renderDownloadAttachments()}*/}
                {this._renderUploadAttachments()}
            </div>
        )
    }
    _renderFileAttachments() {
        const {files} = this.state.draft
        const nonImageFiles = this._nonImageFiles(files).map(file =>
            this._renderFileAttachment(file, 'Attachment')
        )
        const imageFiles = this._imageFiles(files).map(file =>
            this._renderFileAttachment(file, 'Attachment:Image')
        )
        return nonImageFiles.concat(imageFiles)
    }

    _renderDownloadAttachments() {
        const {downloads} = this.props.draft
        const nonImageFiles = this._nonImageFiles(downloads).map(file =>
            this._renderFileAttachment(file, 'Attachment')
        )
        const imageFiles = this._imageFiles(downloads).map(file =>
            this._renderFileAttachment(file, 'Attachment:Image')
        )
        return nonImageFiles.concat(imageFiles)
    }


    _renderFileAttachment(file, role) {
        const props = {
            file,
            removable: true,
            clientId: this.props.clientId,
            download: this.state.downloads[file.id]
        }

        if(role === 'Attachment') {
            return (
                <AttachmentComponent key={file.id} className="file-wrap" {...props}/>
            )
        } else {
            return (
                <ImageAttachmentComponent key={file.id} className="file-wrap file-image-wrap" {...props}/>
            )
        }

    }

    _renderUploadAttachments() {
        const {uploads} = this.state.draft

        const nonImageUploads = this._nonImageFiles(uploads).map((upload, index) =>
            <FileUpload key={`file-upload-${index}`} upload={upload} clientId={this.props.clientId} />
        )
        const imageUploads = this._imageFiles(uploads).map((upload, index) =>
            <ImageFileUpload key={`image-file-upload-${index}`} upload={upload} clientId={this.props.clientId} />
        )
        return nonImageUploads.concat(imageUploads)
    }

    _imageFiles(files) {
        return _.filter(files, NylasUtils.shouldDisplayAsImage)
    }

    _nonImageFiles(files) {
        return _.reject(files, NylasUtils.shouldDisplayAsImage)
    }

    _renderSignature() {
        const {hideSignature} = this.state.draft
        if (hideSignature) return (<div></div>)

        const signature = Meteor.user().profile.signature//AccountStore.signatureForAccountId(this.state.draft.account_id)

        if (!signature || signature.length == 0) return (<div></div>)
        return (
            <div style={{position: 'relative'}}>
                <i className="fa fa-close"
                   style={{position: 'absolute', top: 0, left: 0, fontSize: 10, color: 'lightgray'}}
                   onClick={this._onClickHideSignature}></i>
                <div style={{paddingLeft: 5}}><EmailFrame content={signature}/></div>
            </div>
        )
    }

    _renderActions() {
        const {clientId} = this.props
        const {draft} = this.state
        return (
            <div className="composer-action-bar-wrap">
                <div className="composer-action-bar-content">
                    {
                        !this.props.lazySend && <SendActionButton
                            clientId={clientId}
                            draft={draft}
                            disabled={this._isUnableToSend}
                            isValidDraft={this._isValidDraft}
                        />
                    }
                    <div style={{order: 0, flex: 1}}/>
                    <AttachActionButton
                        tabIndex={-1}
                        ref="attachActionButton"
                        clientId={clientId}
                        draft={draft}
                    />
                </div>
            </div>
        )
    }

    _onChangeSubject = (e) => {
        const subject = e.target.value

        this._changeDraftStore({subject})

        this.setState({draft: this._getDraftFromStore()})
    }
    _onChangeBody = (text) => {
        if (this.state.draft.body !== text) {
            this._changeDraftStore({body: text})

            this.setState({draft: this._getDraftFromStore()})
        }
    }

    _onChangeFrom = (account) => {
        this._changeDraftStore({
            account_id: account.accountId,
            from: [{email: account.emailAddress, name: account.name}]
        })

        this.setState({draft: this._getDraftFromStore()})
    }
    _onChangeTo = (contacts) => {
        this._changeDraftStore({to: contacts})

        this.setState({draft: this._getDraftFromStore()})
    }

    _onChangeCc = (contacts) => {
        this._changeDraftStore({cc: contacts})

        this.setState({draft: this._getDraftFromStore()})
    }

    _onChangeBcc = (contacts) => {
        this._changeDraftStore({bcc: contacts})

        this.setState({draft: this._getDraftFromStore()})
    }

    _onChangeTemplate = (template) => {
        this._changeDraftStore({subject: template ? template.subject : '', body: template ? template.body : ''}, true)
        this.setState({draft: this._getDraftFromStore()})
    }

    _onClickCc = (e) => {
        this.setState({expandedCc: true})
    }

    _onClickBcc = (e) => {
        this.setState({expandedBcc: true})
    }

    _onClickHideSignature = () => {
        this._changeDraftStore({hideSignature: true})
        this.setState({draft: this._getDraftFromStore()})
    }
    _isUnableToSend = () => !this.state.draft || !this.state.draft.to || this.state.draft.to.length == 0 || DraftStore.isUploadingDraftFiles(this.props.clientId)


    _isValidDraft = (options = {}) => {
        if (DraftStore.isSendingDraft(this.props.clientId)) {
            return false
        }

        if (!this.state.draft) return false

        let dealbreaker = null

        if(DraftStore.isUploadingDraftFiles(this.props.clientId)) {
            dealbreaker = 'Some attachments is uploading now. please wait for uploading'
        }

        const {to, cc, bcc, subject, body, files, uploads} = this.state.draft
        const allRecipients = [].concat(to, cc, bcc)


        for (const contact of allRecipients) {
            if (!NylasUtils.isValidContact(contact)) {
                dealbreaker = `${contact.email} is not a valid email address - please remove or edit it before sending.`
            }
        }
        if (allRecipients.length === 0) {
            dealbreaker = 'You need to provide one or more recipients before sending the message.'
        }

        if (dealbreaker) {
            return alert(dealbreaker)
        }

        const bodyIsEmpty = !body || body.length == 0
        const forwarded = NylasUtils.isForwardedMessage({subject, body})
        const hasAttachment = (files || []).length > 0 || (uploads || []).length > 0

        const warnings = []

        if (subject.length === 0) {
            warnings.push('without a subject line')
        }

        if (this._mentionsAttachment(body) && !hasAttachment) {
            warnings.push('without an attachment')
        }

        if (bodyIsEmpty && !forwarded && !hasAttachment) {
            warnings.push('without a body')
        }

        if ((warnings.length > 0) && (!options.force)) {
            if (confirm(`Send ${warnings.join(' and ')}?`)) {
                return this._isValidDraft({force: true})
            }
            return false
        }

        return true

    }
    _mentionsAttachment = (body) => 
        /*let cleaned = QuotedHTMLTransformer.removeQuotedHTML(body.toLowerCase().trim());
         const signatureIndex = cleaned.indexOf('<signature>');
         if (signatureIndex !== -1) {
         cleaned = cleaned.substr(0, signatureIndex - 1);
         }
         return (cleaned.indexOf("attach") >= 0);*/
         false
}