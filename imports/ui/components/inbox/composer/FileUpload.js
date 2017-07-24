import React from 'react';
import NylasUtils from '/imports/api/nylas/nylas-utils'
import Actions from '/imports/api/nylas/actions'


export default class FileUpload extends React.Component {
    static displayName = 'FileUpload';

    static propTypes = {
        clientId: React.PropTypes.string,
        upload: React.PropTypes.object,
    };

    _onClickRemove = (event) => {
        event.preventDefault();
        Actions.removeAttachment({clientId:this.props.clientId, upload:this.props.upload});
    }


    _uploadProgressStyle() {
        const {upload} = this.props
        const percent = upload ? upload.percent || 0 : 0;
        return {
            width: `${percent}%`,
        }
    }

    render() {
        return (
            <div className="file-wrap file-upload">
                <div className="inner">
                    <span className={`progress-bar-wrap state-${this.props.upload.status}`}>
                      <span className="progress-background"/>
                      <span className="progress-foreground" style={this._uploadProgressStyle()}/>
                    </span>
                    <div style={{display:'flex', flexDirection: 'row', alignItems: 'center', height:'100%'}}>
                        <div className="file-info-wrap">
                            <img
                                className="file-icon"
                                src={`/icons/attachments/${NylasUtils.fileIcon(this.props.upload)}`}
                            />
                            <span className="file-name">
                                <span className="uploading">
                                  {this.props.upload.name}
                                </span>
                              </span>
                        </div>
                        <div className="file-action-icon" onClick={this._onClickRemove}>
                            <img
                                src="/icons/attachments/remove-attachment.png"
                            />
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}
