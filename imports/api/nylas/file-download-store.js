import Reflux from 'reflux'
import Actions from './actions'
import AccountStore from './account-store'
import Download from './downloads/download'
import EmailFileDownload from './downloads/email-file-download'
import NylasUtils from './nylas-utils'

class FileDownloadStore extends Reflux.Store {
    constructor() {
        super()

        this.listenTo(Actions.fetchImage, this.onFetchImage)
        this.listenTo(Actions.downloadFile, this.onDownloadFile)
        this.listenTo(Actions.downloadFiles, this.onDownloadFiles)
        this.listenTo(Actions.abortDownloadFile, this.onAbortDownloadFile)

        this._downloads = {}
    }

    downloadDataForFile = (fileId) => this._downloads[fileId] ? this._downloads[fileId].data() : null

    downloadDataForFiles = (fileIds=[]) => {
        const downloadData = {}
        fileIds.forEach((fileId) => [
            downloadData[fileId] = this.downloadDataForFile(fileId)
        ])

        return downloadData
    }

    onFetchImage = (file) => {
        if(NylasUtils.shouldDisplayAsImage(file)) {
            this._runDownload(file)
        }
    }
    onDownloadFile = (file, provider='email') => {
        const token = AccountStore.tokenForAccountId(file.account_id)
        const QueryString = require('query-string')
        const query = QueryString.stringify({
            access_token: token,
            file_id: file.id
        })
        window.open(`/api/download?${query}`)
    }

    onAbortDownloadFile = (file) => {

    }

    _runDownload = (file) => {
        try {
            if(this._downloads[file.id]) {
                this.trigger()
                return Promise.resolve(this._downloads[file.id])
            } else {
                const download = new EmailFileDownload({
                    fileId: file.id,
                    filename: file.name || file.filename,
                    filesize: file.size,
                    accountId: file.account_id,
                    contentType: file.content_type,
                    progressCallback: () => this.trigger()
                })

                this._downloads[file.id] = download
                this.trigger()

                return download.run().finally(() => {
                    //download.ensureClosed()
                    if(download.state == Download.State.Failed)
                        delete this._downloads[file.id]
                    this.trigger()
                })
            }

        } catch(err) {
            console.error('FileDownloadError', err)
            return Promise.reject(err)
        }
    }
}

module.exports = new FileDownloadStore()