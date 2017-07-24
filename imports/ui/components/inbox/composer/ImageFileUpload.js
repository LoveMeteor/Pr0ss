import React from 'react';
import FileUpload from './FileUpload';

export default class ImageFileUpload extends FileUpload {
    static displayName = 'ImageFileUpload';

    static propTypes = {
        uploadData: React.PropTypes.object,
    };

    constructor(props) {
        super(props)

    }

    componentDidMount() {
    }
    onLoadImage = (e) => {
        if(this.refs.previewImageFileUpload) this.refs.previewImageFileUpload.src = e.target.result
    }
    _onDragStart = (event) => {
        event.preventDefault();
    }

    render() {
        const imageReader = new FileReader()
        imageReader.onload = this.onLoadImage
        imageReader.readAsDataURL(this.props.upload.file)

        return (
            <div className="file-wrap file-image-wrap file-upload">
                <div className="file-action-icon" onClick={this._onClickRemove}>
                    <img src="/icons/inbox/image-cancel-button@2x.png" width={23}/>
                </div>

                <div className="file-preview">
                    <div className="file-name-container">
                        <div className="file-name">{this.props.upload.name}</div>
                    </div>

                    <img id={`image-${this.props.upload.id}`} ref="previewImageFileUpload" onDragStart={this._onDragStart}/>
                </div>
            </div>
        );
    }
}
