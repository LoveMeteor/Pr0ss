import _ from 'underscore'
import Reflux from 'reflux'
import Actions from './actions'
import DraftFactory from './draft-factory'
import SendDraftTask from './tasks/send-draft-task'
import SyncbackDraftFilesTask from './tasks/syncback-draft-files-task'
import NylasUtils from './nylas-utils'
import NylasAPI from './nylas-api'
import {insertMessageForSalesRecord} from '/imports/api/models/messages/methods'
import { SalesRecords, Conversations } from '/imports/api/models'

const ComposeType = {
    Creating: 'creating',
    Replying: 'replying',
    ReplyingAll: 'replying all',
    Forwarding: 'forwarding'
}
class DraftStore extends Reflux.Store {
    constructor() {
        super()
        this.listenTo(Actions.composeNew, this._onComposeNew)
        this.listenTo(Actions.composeReply, this._onComposeReply)
        this.listenTo(Actions.composeForward, this._onComposeForward)
        this.listenTo(Actions.sendDraft, this._onSendDraft)
        this.listenTo(Actions.sendDraftSuccess, this._onSendDraftSuccess)
        this.listenTo(Actions.sendDraftFailed, this._onSendDraftFailed)
        this.listenTo(Actions.removeFile, this._onRemoveFile)

        this._drafts = []
        this._draftsSending = {}
        this._draftsViewState = {}
    }

    _onComposeNew = ({salesRecordId, conversationId, modal = true, show = true} = {}) => {
        DraftFactory.createDraft().then((draft) => {
            if(salesRecordId) {
                draft.salesRecordId = salesRecordId
                const participants = SalesRecords.findOne(salesRecordId).getParticipants()
                draft.to = participants.filter(p => p.isMain).map(p => ({name:p.name, email:p.defaultEmail()}))
                draft.cc = participants.filter(p => !p.isMain).map(p => ({name:p.name, email:p.defaultEmail()}))
            } else if(conversationId) {
                draft.conversationId = conversationId
                const participants = Conversations.findOne(conversationId).getParticipants()
                draft.to = participants.filter(p => p.isMain).map(p => ({name:p.name, email:p.defaultEmail()}))
                draft.cc = participants.filter(p => !p.isMain).map(p => ({name:p.name, email:p.defaultEmail()}))
            }
            this._drafts.push(draft)

            if(modal) this.hideModals()
            this._draftsViewState[draft.clientId] = {
                clientId: draft.clientId,
                modal,
                show
            }

            this.trigger()
        })
    }

    _onComposeReply = ({message, type, modal, salesRecordId, conversationId}) => {
        if (!message) return


        const existingDraft = this.draftForReply(message.thread_id, message.id)

        if (existingDraft) {
            const {to, cc} = type == 'reply-all' ? NylasUtils.participantsForReplyAll(message) : NylasUtils.participantsForReply(message)
            existingDraft.to = to
            existingDraft.cc = cc

            if(modal) this.hideModals()

            this._draftsViewState[existingDraft.clientId] = {
                clientId: existingDraft.clientId,
                modal,
                show: true
            }
            this.trigger()
        } else {
            DraftFactory.createDraftForReply({message, type}).then((draft) => {
                draft.salesRecordId = salesRecordId
                draft.conversationId = conversationId
                this._drafts.push(draft)

                if(modal) this.hideModals()
                this._draftsViewState[draft.clientId] = {
                    clientId: draft.clientId,
                    modal,
                    show: true
                }

                this.trigger()
            })
        }
    }


    _onComposeForward = ({message, modal, salesRecordId, conversationId}) => {
        DraftFactory.createDraftForForward({message}).then((draft) => {
            draft.salesRecordId = salesRecordId
            draft.conversationId = conversationId
            this._drafts.push(draft)

            if(modal) this.hideModals()
            this._draftsViewState[draft.clientId] = {
                clientId: draft.clientId,
                modal,
                show: true
            }

            this.trigger()
        })
    }

    hideModals = () => {
        Object.keys(this._draftsViewState).forEach(key => {
            this._draftsViewState[key]['modal'] = false
        })
    }
    createDraftForQuoteEmail = (data = {}) => new Promise((resolve, reject) => {
            DraftFactory.createDraft(data).then((draft) => {
                draft.hideSignature = true
                this._drafts.push(draft)

                this._draftsViewState[draft.clientId] = {
                    clientId: draft.clientId
                }

                resolve(draft)
            })
        })

    _onSendDraft(clientId) {
        const draft = this.draftForClientId(clientId)
        if(!draft) return

        this._draftsSending[clientId] = true

        if(draft.files && draft.files.length > 0 || draft.uploads && draft.uploads.length > 0) {
            //Actions.queueTask(new SyncbackDraftFilesTask(draft.clientId))
        }
        Actions.queueTask(new SendDraftTask(clientId))

        this._draftsViewState[clientId] = {
            modal: false,
            show: false
        }
        this.trigger()
    }

    _onSendDraftSuccess = ({message, clientId} = {}) => {
        const draft = this.draftForClientId(clientId)
        console.log('_onSendDraftSuccess', message, clientId, draft)

        const {salesRecordId, conversationId} = draft

        if (salesRecordId || conversationId) {    // Update conversations for sales record
            try {
                insertMessageForSalesRecord.call({salesRecordId, conversationId, message})
            } catch(err) {
                console.error(err)
            }
        }

        this.removeDraftForClientId(clientId)
        this.trigger()
    }

    _onSendDraftFailed = ({threadId, clientId, errorMessage} = {}) => {
        alert(`Failed to send draft with clientId="${clientId}" because of "${errorMessage}"`)
        this.trigger()
    }

    _onRemoveFile = ({file,clientId}) => {
        this.removeFileFromDraftForClientId(clientId, file)
    }
    draftForClientId(clientId) {
        return _.findWhere(this._drafts, {clientId})
    }

    draftForReply(threadId, messageId) {
        return _.findWhere(this._drafts, {thread_id: threadId, reply_to_message_id: messageId})
    }

    changeDraftForClientId(clientId, data = {}) {
        let draft = this.draftForClientId(clientId)

        draft = _.extend(draft, data)
    }

    addUploadToDraftForClientId(clientId, upload) {
        const draft = this.draftForClientId(clientId)
        if(draft) {
            if(!draft.uploads) draft.uploads = []
            draft.uploads.push(upload)

            this.trigger()
        }
    }

    removeUploadFromDraftForClientId(clientId, upload) {
        const draft = this.draftForClientId(clientId)
        if(draft && draft.uploads) {
            const index = _.indexOf(draft.uploads, upload)

            draft.uploads.splice(index,1)
            this.trigger()

            upload.cancel()
        }
    }

    addFileToDraftForClientId(clientId, file) {
        const draft = this.draftForClientId(clientId)
        if(draft) {
            if(!draft.files) draft.files = []
            draft.files.push(file)

            this.trigger()
        }
    }

    removeFileFromDraftForClientId(clientId, file) {
        const draft = this.draftForClientId(clientId)
        if(draft && draft.files) {
            const index = _.indexOf(draft.files, file)

            draft.files.splice(index,1)
            this.trigger()
        }
    }


    removeDraftForClientId(clientId) {
        const draft = this.draftForClientId(clientId)

        if (!draft) return

        if(draft.uploads) {
            draft.uploads.forEach((upload) => {
                upload.cancel()
            })
        }
        const index = _.indexOf(this._drafts, draft)

        if (index > -1)
            this._drafts.splice(index, 1)

        if (this._draftsViewState[clientId]) delete this._draftsViewState[clientId]

        this.trigger()
    }

    isSendingDraft(clientId) {
        return this._draftsSending[clientId] ? true : false
    }

    draftViewStateForModal() {
        const states = _.values(this._draftsViewState)

        const stateForModal = _.findWhere(states, {modal: true})

        return stateForModal
    }

    isUploadingDraftFiles(clientId) {
        const draft = this.draftForClientId(clientId)

        return draft.uploads && draft.uploads.some(upload => upload.isUploading())
    }
}

module.exports = new DraftStore()
