import React, { Component, PropTypes } from 'react';
import { ProgressBar } from 'react-bootstrap';
import { info, warning } from '/imports/api/lib/alerts';
import MediaUploader from '../libs/MediaUploader';
import {Treebeard, decorators} from './accordionview';
import { getUserName, getUserEmail, getSlackUsername, getAvatarUrl } from '../../../api/lib/filters';
import swal from 'sweetalert2';
import 'sweetalert2/dist/sweetalert2.min.css';

var fileview_data = [];
var folder_ct = 0;

function extract(data, parent) {
    let cur_idx = folder_ct;
    let i = 0;
    fileview_data[cur_idx] = {data: data, parent: parent};
    folder_ct++;
    for (; i < data.children.length; i++) {
        if (data.children[i].mimeType == "application/vnd.google-apps.folder") {
            extract(data.children[i], cur_idx);
        }
    }
}

function update_fileview_data(node) {
    let i = 0;
    for(; i<folder_ct; i++) {
        if (fileview_data[i].id == node.id) {
            fileview_data[i].children = node.children;
            fileview_data[i].loading = node.loading;
        }
    }
}

function getParentFolder(fileId) {
    let i = 0, j;
    for(; i<folder_ct; i++) {
        if (fileview_data[i].data.id == fileId)
            return fileview_data[i].data;
        for(j=0; fileview_data[i].data.children && j<fileview_data[i].data.children.length; j++) {
            if (fileview_data[i].data.children[j].id == fileId) {
                return fileview_data[i].data;
            }
        }
    }
}

function merge_fileview_data() {
    let i = folder_ct - 1, j;
    var parent_idx;
    for (; i > 0; i--) {
        parent_idx = fileview_data[i].parent;
        for (j=0; j< fileview_data[parent_idx].data.children.length; j++ ) {
            if (fileview_data[parent_idx].data.children[j].id == fileview_data[i].data.id)
                fileview_data[parent_idx].data.children[j].children = fileview_data[i].data.children;
        }
    }
    return fileview_data[0].data;
}

// Example: Customising The Header Decorator To Include Icons
decorators.Header = (props) => {
    const style = props.style;
    const iconType = props.node.children ? 'folder' : 'file-text';
    const iconClass = `fa fa-${iconType}`;
    const iconStyle = { marginRight: '5px' };
    style.title.display = 'inline-block';
    return (
        <div style={style.base}>
            <div style={style.title}>
                {
                  (props.node.children) ? (
                    <i className='fa fa-folder' style={iconStyle}/>
                  ) : (
                    <img src={props.node.iconLink}/>
                  )
                }
                &nbsp; {props.node.name}
            </div>
            {
              ( !props.node.preventRemove ) ? (
                <a href='#' style={{marginLeft: 20}} onClick={(event)=> props.removeFile(props.node.id, props.node.name, event)}>
                    <span className='fa fa-times'/>
                </a>
              ) : ''
            }
        </div>
    );
};

class Files extends Component {
    constructor(props) {
        super(props);
        this.addFile = this.addFile.bind(this);
        this.renderAttachFiles = this.renderAttachFiles.bind(this);
        this.renderRemoteFiles = this.renderRemoteFiles.bind(this);
        this.uploadFiles = this.uploadFiles.bind(this);
        this.removeFile = this.removeFile.bind(this);
        this.addGooglefiles = this.addGooglefiles.bind(this);
        this.onToggle = this.onToggle.bind(this);
        this.token = null;
        this.state = {
            files: [],
            remoteFiles: [],
            loadingRemoteFiles: true,
            folderId: "",
            msgstring: "",
            data: {}
        }
        switch(props.type) {
            case 'project':
                this.rootfolderId = props.project.folderId;
                this.slackChannel = props.project.slackChanel;
                if (!this.rootfolderId) warning('Your folder was not created yet')
                break;
            case 'salesRecord':
                this.rootfolderId = props.salesRecord.folderId;
                this.slackChannel = props.salesRecord.slackChanel;
                if (!this.rootfolderId) warning('Your folder was not created yet')
                break;
        }
        this.state.folderId = this.rootfolderId;
    }

    componentDidMount() {
        Meteor.call('drive.getAccessToken', {}, (error, token)=> {
            if (error) {
                return warning('could not connect to google drive');
            }
            this.token = token;
        });
        googledrv_filedata = [];
        filedata_ct = 0;
        callback_ct = 0;

        //getFileList(this.rootfolderId, 0);
        var data = {name: "root", toggled: true, children:[], mimeType: 'application/vnd.google-apps.folder', id:this.rootfolderId, preventRemove: true};

        Meteor.call('drive.listFiles', {query: `'${this.state.folderId}' in parents and trashed = false`}, (error, result)=> {
            if (error) {
                return warning('could not list files from google drive');
            }
            data.children = _.sortBy(result.files, ({ name }) => name);
            data.children.forEach(function(item, index) {
               if (item.mimeType == 'application/vnd.google-apps.folder') {
                   data.children[index].loading = true;
                   data.children[index].children = [];
               }
            });
            this.setState({
                data: data,
                loadingRemoteFiles: false,
            });
        })
    }

    updateSelectedFolder() {
        let curnode = this.state.cursor;
        Meteor.call('drive.listFiles', {query: `'${curnode.id}' in parents and trashed = false`}, (error, result)=> {
            if (error) {
                return warning('could not list files from google drive');
            }
            curnode.children = _.sortBy(result.files, ({ name }) => name);
            curnode.children.forEach(function (item, index) {
                if (item.mimeType == "application/vnd.google-apps.folder") {
                    curnode.children[index].loading = true;
                    curnode.children[index].children = [];
                }
            });
            curnode.loading = false;
            fileview_data = [];
            folder_ct = 0;
            extract(this.state.data, -1);
            update_fileview_data(curnode);
            this.setState({
                data: merge_fileview_data(),
                loadingRemoteFiles: false,
            });
        });
        curnode.loading = true;
        fileview_data = [];
        folder_ct = 0;
        extract(this.state.data, -1);
        update_fileview_data(curnode);
        this.setState({
            data: merge_fileview_data(),
            loadingRemoteFiles: false,
        });

    }

    addGooglefiles(event) {
        event.preventDefault();
        if (!this.state.cursor || this.state.cursor.mimeType != 'application/vnd.google-apps.folder') {
            this.setState({msgstring: 'Please select folder!'});
            return ;
        }
        var file_name = prompt('Please enter new file name', 'Create new file');

        if (file_name == null)
            return;
        var filetype = '';
        var file_url = '';
        switch (event.target.getAttribute('data-val')) {
            case 'Docs':
                filetype = 'application/vnd.google-apps.document';
                break;
            case 'Spreadsheet':
                filetype = 'application/vnd.google-apps.spreadsheet';
                break;
            case 'Slide':
                filetype = 'application/vnd.google-apps.presentation';
                break;
            case 'Drawing':
                filetype = 'application/vnd.google-apps.drawing';
                break;
        }
        const file = {
            name: file_name,
            parent: this.state.cursor.id,
            filetype: filetype
        };

        //this.setState({msgstring: 'Creating new Google '+event.target.getAttribute('data-val')+' file...'});

        Meteor.call('drive.createFile', file, (error, result)=> {
            if (error) {
                return warning('could not list files from google drive');
            }
            switch (filetype) {
                case 'application/vnd.google-apps.document':
                    file_url = 'https://www.googleapis.com/drive/v3/files/'+this.state.cursor.id+'/export?mimeType=application/vnd.openxmlformats-officedocument.wordprocessingml.document&alt=media&access_token='+this.token;
                    break;
                case 'application/vnd.google-apps.spreadsheet':
                    file_url = 'https://www.googleapis.com/drive/v3/files/'+this.state.cursor.id+'/export?mimeType=application/vnd.openxmlformats-officedocument.spreadsheetml.sheet&alt=media&access_token='+this.token;
                    break;
                case 'application/vnd.google-apps.presentation':
                    file_url = 'https://www.googleapis.com/drive/v3/files/'+this.state.cursor.id+'/export?mimeType=application/vnd.openxmlformats-officedocument.presentationml.presentation&alt=media&access_token='+this.token;
                    break;
                case 'application/vnd.google-apps.drawing':
                    file_url = 'https://www.googleapis.com/drive/v3/files/'+this.state.cursor.id+'/export?mimeType=application/pdf&alt=media&access_token='+this.token;
                    break;
            }
            this.setState({msgstring: ''});
            this.updateSelectedFolder();
            if(typeof this.slackChannel === 'undefined') return;

            const params = {
                username: getSlackUsername(this.props.usersArr[Meteor.userId()]),
                icon_url: getAvatarUrl(this.props.usersArr[Meteor.userId()]),
                attachments: [
                    {
                        "color": "#36a64f",
                        "text": `<${file_url}|Go to file ${file_name}>`
                    }
                ]
            };

            const slackText = `I just added new file named as "${file_name}"`;
            Meteor.call("sendBotMessage", this.slackChannel, slackText, params);
            //console.log ('successfully created google docs!');
        });
    }

    removeFile(fileId, fileName, event) {
        event.preventDefault();
        swal({
          title: 'Are you sure?',
          text: "You won't be able to revert this!",
          type: 'warning',
          showCancelButton: true,
          confirmButtonColor: '#3085d6',
          cancelButtonColor: '#d33',
          confirmButtonText: 'Yes, delete it!'

        }).then(()=> {
          Meteor.call('drive.removeFiles', { fileId }, (err)=> {
            swal(
              'Deleted!',
              'Your file has been deleted.',
              'success'
            )
            let parentNode;
            fileview_data = [];
            folder_ct = 0;
            extract(this.state.data, -1);
            parentNode = getParentFolder(fileId);
            this.setState({ cursor: parentNode, folderId: parentNode.id });
            this.updateSelectedFolder();
            if(typeof this.slackChannel === 'undefined') return;

            const params = {
              username: getSlackUsername(this.props.usersArr[Meteor.userId()]),
              icon_url: getAvatarUrl(this.props.usersArr[Meteor.userId()]),
              attachments: [
                {
                  "color": "#36a64f",
                  "text": `<Removed ${fileName}>`
                }
              ]
            };

            const slackText = `I just removed the file named as "${fileName}"`;
            Meteor.call("sendBotMessage", this.slackChannel, slackText, params);
          });
        })
    }

    onToggle(node, toggled){
        if(this.state.cursor){this.state.cursor.active = false;}
        node.active = true;
        if (node.mimeType == 'application/vnd.google-apps.folder') {
            if (node.loading == true) {
                Meteor.call('drive.listFiles', {query: `'${node.id}' in parents and trashed = false`}, (error, result)=> {
                    if (error) {
                        return warning('could not list files from google drive');
                    }
                    node.children = _.sortBy(result.files, ({ name }) => name);
                    node.children.forEach(function (item, index) {
                        if (item.mimeType == 'application/vnd.google-apps.folder') {
                            node.children[index].loading = true;
                            node.children[index].children = [];
                        }
                    });
                    node.loading = false;
                    fileview_data = [];
                    folder_ct = 0;
                    extract(this.state.data, -1);
                    update_fileview_data(node);
                    this.setState({
                        data: merge_fileview_data(),
                        loadingRemoteFiles: false,
                    });
                })
            }
        } else {
            window.open(node.webViewLink, '_blank');
        }
        if(node.children){ node.toggled = toggled; }
        this.setState({ cursor: node, folderId: node.id });
    }

    renderRemoteFiles() {
        return (
            <Treebeard
                data={this.state.data}
                onToggle={this.onToggle}
                decorators={decorators}
                removeFile={this.removeFile}
            />
        )
    }

    renderAttachFiles() {
        return (
            <div>
                {
                    this.state.files.map(({ name, id, uploaded })=> {
                        if (uploaded < 100) {
                            return (
                                <div className='attached-file' key={id}>
                                    <span className='file-name'>{name}</span>
                                    <ProgressBar active now={uploaded} style={{height: '5px', marginBottom: 0}}/>
                                </div>
                            );
                        }
                    })
                }
            </div>
        )
    }

    uploadFiles(files) {
        let nCompleteFiles = 0;
        const nFiles = files.length;
        files.forEach((file)=> {
            const uploader = new MediaUploader({
                file,
                token: this.token,
                metadata: {
                    parents: [this.state.folderId],
                },
                onProgress: ({ loaded, total })=> {
                    const percentage = Math.round(loaded/total * 100);
                    file.uploaded = percentage;
                    this.setState({ files: this.state.files });
                },
                onComplete: (remoteFile)=>  {
                    let parentNode;
                    fileview_data = [];
                    folder_ct = 0;
                    extract(this.state.data, -1);
                    parentNode = getParentFolder(this.state.folderId);
                    this.setState({ cursor: parentNode, folderId: parentNode.id });
                    this.updateSelectedFolder();
                    if(typeof this.slackChannel === 'undefined') return;

                    const params = {
                        username: getSlackUsername(this.props.usersArr[Meteor.userId()]),
                        icon_url: getAvatarUrl(this.props.usersArr[Meteor.userId()]),
                        attachments: [
                            {
                                "color": "#36a64f",
                                "text": `<Uploaded ${remoteFile}>`
                            }
                        ]
                    };

                    const slackText = 'I just uploaded new file';
                    Meteor.call("sendBotMessage", this.slackChannel, slackText, params);
                    nCompleteFiles ++;
                    if (nCompleteFiles === nFiles) {
                      this.refs.file.value = '';
                    }
                }
            });
            uploader.upload();
        });
    }

    addFile(event) {
        event.preventDefault();
        let files = _.toArray(event.target.files).map((file)=> {
            file.id = Meteor.uuid();
            file.uploaded = 0;
            return file;
        });
        this.uploadFiles(files);
        this.setState({ files: this.state.files.concat(files) });
    }

    render() {
        return (
            <div className='file-tab default-form'>
                <div className='row'>
                    <div className='col-md-8'>
                        <div>{this.state.msgstring}</div>
                        <a href={`https://drive.google.com/drive/folders/${this.state.folderId}`} target='_blank'>
                            <span className='file-name hand-cursor'>Open Current Folder</span>
                        </a>
                        &nbsp;&nbsp;
                        <a href={`https://drive.google.com/drive/folders/${this.state.data.id}`} target='_blank'>
                            <span className='file-name hand-cursor'>Open Root Folder</span>
                        </a>
                        {
                            (this.state.loadingRemoteFiles) ? (
                                <div>Loading data from google drive .... </div>
                            ) : (
                                this.renderRemoteFiles()
                            )
                        }
                    </div>
                    <div className='col-md-4'>
                        <div className='text-center'>
                            <span className='label'>Add pdf file</span>
                            <label htmlFor='quote-file'
                              className='file-label'/>
                            <input type='file'
                              ref='file'
                              id='quote-file'
                              onChange={this.addFile}/>
                        </div>
                        <div className='text-center'>
                            <span className='label'>Add Google Docs file</span>
                            <input type='button' className='hand-cursor' onClick={this.addGooglefiles} data-val='Docs' value='Add Google Docs file'/>
                        </div>
                        <div className='text-center'>
                            <span className='label'>Add Google SpreadSheet file</span>
                            <input type='button' className='hand-cursor' onClick={this.addGooglefiles} data-val='Spreadsheet' value='Add Google SpreadSheet file'/>
                        </div>
                        <div className='text-center'>
                            <span className='label'>Add Google Slides file</span>
                            <input type='button' className='hand-cursor' onClick={this.addGooglefiles} data-val='Slide' value='Add Google Slides file'/>
                        </div>
                        <div className='text-center'>
                            <span className='label'>Add Google Drawing file</span>
                            <input type='button' className='hand-cursor' onClick={this.addGooglefiles} data-val='Drawing' value='Add Google Drawing file'/>
                        </div>
                        <div>
                            {
                                this.renderAttachFiles()
                            }
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}

Files.propTypes  = {
    type: PropTypes.string.isRequired,
}
export default Files;
