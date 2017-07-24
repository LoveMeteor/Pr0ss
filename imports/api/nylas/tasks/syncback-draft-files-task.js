import Task from './task'
import NylasAPI from '../nylas-api'
import {APIError} from '../errors'
import DraftStore from '../draft-store'
import AccountStore from '../account-store'

export default class SyncbackDraftFilesTask extends Task {
    constructor(clientId) {
        super()
        this.clientId = clientId
        this._appliedUploads = null
        this._appliedFiles = null
        this.draft = DraftStore.draftForClientId(clientId)
    }

    label() {
        return 'Uploading attachments...'
    }

    performRemote() {
        return this.uploadAttachments()
            .then(this.applyChangesToDraft)
            .thenReturn(Task.Status.Success)
            .catch((err) => {
                if (err instanceof Error) {
                    return Promise.resolve(Task.Status.Continue)
                }
                if (err instanceof APIError && !NylasAPI.PermanentErrorCodes.includes(err.statusCode)) {
                    return Promise.resolve(Task.Status.Retry)
                }
                return Promise.resolve([Task.Status.Failed, err])
            })
    }

    uploadAttachments = () => {
        const uploaded = [].concat(this.draft.uploads)
        return Promise.all(uploaded.map(this.uploadAttachment)).then((files) => {
            // Note: We don't actually delete uploaded files until send completes,
            // because it's possible for the app to quit without saving state and
            // need to re-upload the file.
            this._appliedUploads = uploaded
            this._appliedFiles = files
        })
    }

    uploadAttachment = (upload) => {
        console.log('Started uploadAttachment', upload)

        const token = AccountStore.tokenForAccountId(this.draft.account_id)
        const xhr = new XMLHttpRequest()
        xhr.open('POST', 'https://api.nylas.com/files', true)
        xhr.setRequestHeader('Authorization', `Basic ${  btoa(`${token}:`)}`)
        xhr.upload.onprogress = function (e) {
            console.log(e)
        }
        xhr.onloadend = function (e) {
            console.log(e)
        }
        xhr.send(upload.slice(0,upload.size))

    }

    applyChangesToDraft = () => {
        this.draft.files = this.draft.files.concat(this._appliedFiles)
        if (this.draft.uploads instanceof Array) {
            const uploaded = this._appliedUploads
            this.draft.uploads = this.draft.uploads.filter((upload) =>
                !uploaded.includes(upload)
            )
        }
        return Promise.resolve(this.draft)
    }
}