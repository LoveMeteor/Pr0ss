import Reflux from 'reflux'
import _ from 'underscore'
import axios from 'axios'
import Actions from './actions'
import AccountStore from './account-store'
import NylasUtils from './nylas-utils'
import DraftStore from './draft-store'

class Upload {
    static Status = {
        Uploading: 'uploading',
        Success: 'success',
        Failed: 'failed'
    }
    constructor({clientId, file}) {
        this.id = NylasUtils.generateTempId()
        this.name = file.name
        this.size = file.size
        this.file = file

        const token = AccountStore.tokenForAccountId(DraftStore.draftForClientId(clientId).account_id)

        const data = new FormData()
        data.append('file', file)

        this.requestSource = axios.CancelToken.source()

        const self = this
        axios.post('https://api.nylas.com/files', data, {
            auth: {
                username: token,
                password: ''
            },
            timeout: 20 * 60 * 1000,
            onUploadProgress (progressEvent) {
                if(this.onUploadProgress) this.onUploadProgress(progressEvent)

                const {loaded, total} = progressEvent
                //console.log(progressEvent,100 * loaded / total, self)
                self.percent = 100 * loaded / total
                DraftStore.trigger()
            },
            cancelToken: self.requestSource.token
        })
            .then(res => {
                console.log(res)
                if(res.status == 200 && res.data && res.data.length) {
                    const resFile = res.data[0]

                    if(NylasUtils.shouldDisplayAsImage(self)) resFile.blob = self.file
                    DraftStore.addFileToDraftForClientId(clientId, resFile)
                    DraftStore.removeUploadFromDraftForClientId(clientId, self)
                }
                if(self.onSuccess) self.onSuccess(res)

                self.status = Upload.Status.Success
            })
            .catch(err => {
                console.log(err)
                if(self.onError) self.onError(err)

                self.status = Upload.Status.Failed
            })

        this.status = Upload.Status.Uploading
        this.percent = 0
    }

    cancel() {
        if(this.requestSource) this.requestSource.cancel()
    }

    isUploading() {
        return this.status === Upload.Status.Uploading
    }
}

class FileUploadStore extends Reflux.Store {
    constructor() {
        super()
        this.listenTo(Actions.addAttachment, this._onAddAttachment)
        this.listenTo(Actions.removeAttachment, this._onRemoveAttachment)
    }

    _onAddAttachment = ({clientId, file}) => {
        if(!clientId) throw new Error('You need to pass the ID of the message (draft) this Action refers to')

        this._verifyFile(file)
            .then((file) => this._makeUpload(clientId, file))
            .then((upload) => {console.log(upload)
                DraftStore.addUploadToDraftForClientId(clientId, upload)
            })
            .catch(this._onAttachFileError)
    }

    _onRemoveAttachment = ({clientId, upload}) => {
        if(!upload) return Promise.resolve()

        DraftStore.removeUploadFromDraftForClientId(clientId, upload)
    }

    _verifyFile = (file) => {
        if(file.size > 25 * 1000000)
            return Promise.reject(new Error(`${file.name} can not be attached because it is larger than 25MB.`))
        else
            return Promise.resolve(file)
    }

    _makeUpload = (clientId,file) => {
        const upload = new Upload({clientId,file})
        return Promise.resolve(upload)
    }

    _onAttachFileError = (error) => {
        console.error(error.message)
    }

}
module.exports = new FileUploadStore()