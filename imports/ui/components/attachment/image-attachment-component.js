import React, {PropTypes} from 'react'
import Spinner from '../utils/spinner'
import DraggableImg from '../utils/DraggableImg'
import AttachmentComponent from './attachment-component'
import Download from '/imports/api/nylas/downloads/download'


class ImageAttachmentComponent extends AttachmentComponent {
    static displayName = 'ImageAttachmentComponent';

    static propTypes = {
        file: PropTypes.object.isRequired,
        download: PropTypes.object,
    };

    static containerRequired = false;

    _canAbortDownload() {
        return false
    }

    _renderImage() {
        const {download, file} = this.props

        if(file && file.blob) {
            const imageReader = new FileReader()
            imageReader.onload = this._onLoadImage
            imageReader.readAsDataURL(file.blob)

            return <img id={`image-${file.id}`} ref="previewImageAttachment"/>
        } else if(download && download.blob) {
            return <img id={`image-${download.fileId}`} ref="previewImageAttachment" src={download.blob}/>
        } else {
            return (
                <div style={{width: '100%', height: '100px'}}>
                    <Spinner visible/>
                    <img src="/icons/placeholder.png"/>
                </div>
            )
        }
    }

    _renderRemoveIcon() {
        return (
            <img
                src="/icons/attachments/image-cancel-button.png"
            />
        )
    }

    _renderDownloadButton() {
        return (
            <img
                src="/icons/attachments/image-download-button.png"
            />
        )
    }

    _onLoadImage = (e) => {
        if(this.refs.previewImageAttachment) this.refs.previewImageAttachment.src = e.target.result
    }

    render() {
        const {download, file} = this.props
        const state = download ? download.state || '' : ''
        const displayName = file instanceof File ? file.displayName() : file.name
        return (
            <div className={this.props.className}>
                <span className={`progress-bar-wrap state-${state}`}>
                  <span className="progress-background"></span>
                  <span className="progress-foreground" style={this._downloadProgressStyle()}></span>
                </span>
                {this._renderFileActionIcon()}
                {this._renderSaveToGoogleDrive('image-control')}
                <div className="file-preview" onDoubleClick={this._onClickView}>
                    <div className="file-name-container">
                        <div className="file-name">{displayName}</div>
                    </div>
                    {this._renderImage()}
                </div>
            </div>
        )
    }
}

export default ImageAttachmentComponent
