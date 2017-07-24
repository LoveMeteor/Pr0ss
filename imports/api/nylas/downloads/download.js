import _ from 'underscore'

const State = {
    Unstarted: 'unstarted',
    Downloading: 'downloading',
    Finished: 'finished',
    Failed: 'failed'
}

class Download {
    static State = State

    constructor({fileId, filename, filesize, contentType, progressCallback}) {
        if(!filename || filename.length==0)
            throw new Error('Download.cnstructor: You must provide a non-empty filename.')
        if(!fileId)
            throw new Error('Download.constructor: You must provide a fileId to download')

        this.fileId = fileId
        this.filename = filename
        this.filesize = filesize
        this.contentType = contentType
        this.progressCallback = progressCallback

        this.percent = 0
        this.promise = null
        this.state = State.Unstarted
    }

    /*data() {
        return Object.freeze(_.clone({
            state: this.state,
            fileId: this.fileId,
            percent: this.percent,
            filename: this.filename,
            filesize: this.filesize
        }))
    }*/

    run = () => {}

    ensureClosed = () => {
        if(this.request) this.request.abort()
    }

    setState = (state) => {
        this.state = state
        Actions.downloadStateChanged(this)
    }
}

module.exports = Download