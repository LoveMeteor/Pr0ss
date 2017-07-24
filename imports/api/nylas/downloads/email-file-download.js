import _ from 'underscore'
import Download from './download'
import AccountStore from '../account-store'

class EmailFileDownload extends Download {
    constructor(options = {}) {
        super(options)

        if (!options.accountId)
            throw new Error('Download.constructor: You must provide a non-empty accountId.')

        this.accountId = options.accountId

        this.provider = 'email'
    }

    data() {
        //return _.extend(super.data(), {provider:'email', blob:this.blob});
        return Object.freeze(_.clone({
            state: this.state,
            fileId: this.fileId,
            percent: this.percent,
            filename: this.filename,
            filesize: this.filesize,
            blob: this.blob
        }))
    }

    run = () => {
        // If run has already been called, return the existing promise. Never
        // initiate multiple downloads for the same file
        if (this.promise) return this.promise

        this.promise = new Promise((resolve, reject) => {
            this.state = Download.State.Downloading

            const self = this
            const xhr = new XMLHttpRequest()
            xhr.open('GET', `https://api.nylas.com/files/${self.fileId}/download`, true)
            xhr.responseType = 'arraybuffer'
            xhr.setRequestHeader('Authorization', `Basic ${window.btoa(`${AccountStore.tokenForAccountId(self.accountId)}:`)}`)
            xhr.onload = function(e) {
                if (this.status == 200) {
                    const blob = this.response

                    let binary = ''
                    const bytes = new Uint8Array(blob)
                    const len = bytes.byteLength
                    for (let i = 0; i < len; i++) {
                        binary += String.fromCharCode(bytes[i])
                    }
                    self.blob = `data:${self.contentType};base64,${window.btoa(binary)}`
                    self.state = Download.State.Finished

                    resolve(self)
                }
            }
            xhr.onprogress = function(e) {
                self.percent = e.loaded * 100 / e.total
                if(self.progressCallback) self.progressCallback()
                //console.log(self.percent)
            }
            xhr.send()

        })

        return this.promise
    }

}

module.exports = EmailFileDownload