import React from 'react'
import NylasUtils from '../../../api/nylas/nylas-utils'
import EmailFrame from './EmailFrame'
import CanvasUtils from '../../utils/canvas-utils'

const TransparentPixel = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR4nGNikAQAACIAHF/uBd8AAAAASUVORK5CYII='
class ItemMessageBody extends React.Component{

    constructor(props) {
        super(props)
    }

    render() {
        const body = this._mergeBodyWithFiles(this.props.message.body||'')

        return <EmailFrame showQuotedText={false} content={body}/>
    }

    _mergeBodyWithFiles(body) {
        const {message, downloads} = this.props

        message.files.forEach((file) => {
            const download = downloads[file.id]
            const cidRegexp = new RegExp(`cid:${file.content_id}(['\"]+)`, 'gi')

            if(download) {
                if(!download.blob) {
                    body = body.replace(cidRegexp, (text, quoteCharacter) => {
                        const dataUri = CanvasUtils.dataURIForLoadedPercent(download.percent)
                        return `${dataUri}${quoteCharacter} style=${quoteCharacter} object-position: 50% 50%; object-fit: none; `
                    })
                } else {
                    body = body.replace(cidRegexp, (text, quoteCharacter) => `${download.blob}${quoteCharacter}`)
                }
            }
        })


        body = body.replace(new RegExp('src=[\'\"]cid:([^\'\"]*)[\'\"]', 'g'), `src=\"${TransparentPixel}\"`)

        return body
    }
}

export default ItemMessageBody
