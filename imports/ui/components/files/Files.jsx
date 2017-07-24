import React, { Component } from 'react'
import moment from 'moment'
import styled from 'styled-components'
import _ from 'underscore'
import swal from 'sweetalert2'
import 'sweetalert2/dist/sweetalert2.min.css'
import FileUploader from './FileUploader.jsx'
import {
  getSlackUsername,
  getAvatarUrl
} from '../../../api/lib/filters'

const FileManager = styled.div `
  position: relative;
`
const LoadingIcon = styled.div `
  position: absolute;
  top: 150px;
  left: 50%
`
class Files extends Component {
  constructor(props) {
    super(props)
    const p = props.project ? props.project : props.salesRecord
    const { folderId, name } = p
    this.state = {
      files: [],
      selectedFile: {},
      viewPath: [{ folderId, name }],
      loading: false,
    }
    this.slack = {
      username: getSlackUsername(props.usersArr[Meteor.userId()]),
      icon_url: getAvatarUrl(props.usersArr[Meteor.userId()]),
      chanel: p.slackChanel,
    }
    this.selectFile = this.selectFile.bind(this)
    this.listFiles = this.listFiles.bind(this)
    this.openFile = this.openFile.bind(this)
    this.openFileDirectly = this.openFileDirectly.bind(this)
    this.pickFile = this.pickFile.bind(this)
    this.goBack = this.goBack.bind(this)
    this.renderFiles = this.renderFiles.bind(this)
    this.renderViewPath = this.renderViewPath.bind(this)
    this.addFileToView = this.addFileToView.bind(this)
    this.removeFileFromView = this.removeFileFromView.bind(this)
    this.deleteFile = this.deleteFile.bind(this)
    this.downloadFile = this.downloadFile.bind(this)
    this.openExternal = this.openExternal.bind(this)
    this.createNewFile = this.createNewFile.bind(this)
    this.checkRemoteFolder = _.once(({ folderId, name, type, _id }) => {
      Meteor.call('drive.getFiles', { fileId: folderId }, error => {
        if (error) {
          switch (type) {
            case 'project':
              return Meteor.call('drive.createProjectFolder', { projectId:  _id, name}, this.listFiles)
            case 'salesRecord':
              return Meteor.call('drive.createSalesRecordFolder', { salesRecordId: _id, name }, this.listFiles)
          }
        }
      })
    })
  }

  openFile(folderId, name, mimeType) {
    switch (mimeType) {
      case 'application/vnd.google-apps.folder':
        this.state.viewPath.push({ folderId, name })
        this.listFiles()
        break
    }
  }

  openFileDirectly(folderId) {
    const indexInPath = _.findIndex(this.state.viewPath, item => item.folderId === folderId)
    this.state.viewPath = this.state.viewPath.slice(0, indexInPath + 1)
    this.listFiles()
  }

  listFiles() {
    const folderId = _.last(this.state.viewPath).folderId
    const query = `'${folderId}' in parents and trashed = false`
    // LIST CURRENT FILES
    this.setState({
      files: [],
      loading: true,
      selectedFile: {},
    })
    Meteor.call(
      'drive.listFiles',
      { query },
      (error, { files }) => !error && (this.setState({ files, loading: false }))
    )
  }

  componentDidMount() {
    this.listFiles()
  }

  selectFile(id, name, mimeType, webContentLink, webViewLink) {
    if (this.state.selectedFile.id === id) {
      this.openFile(id, name, mimeType)
    } else {
      this.setState({ selectedFile: { id, mimeType, webContentLink, webViewLink, name } })
    }
  }

  goBack() {
    if (this.state.viewPath.length > 1) {
      this.state.viewPath.pop()
      this.listFiles()
    }
  }

  renderViewPath() {
    const activeFolderId = _.last(this.state.viewPath).folderId
    return (
      <ol className='breadcrumb'>
        {
          this.state.viewPath.map(({ folderId, name }) => {
            if (folderId === activeFolderId)
              return (
                <li
                  className='active'
                  key={folderId}
                  >
                  { name }
                </li>
              )
            return (
              <li
                key={folderId}
                onClick={() => this.openFileDirectly(folderId, name)}
              >
                <a href='#'>{ name }</a>
              </li>
            )
          })
        }
      </ol>
    )
  }

  renderFiles() {
    if (this.state.files.length === 0 && !this.state.loading)
      return (<tr className='text-center'><td colSpan={2}>Empty Folder</td></tr>)
    const files = _.sortBy(this.state.files, ({ modifiedTime }) => - new Date(modifiedTime).getTime())
    return files.map(file => {
      const { id, name, modifiedTime, iconLink, webViewLink, mimeType, webContentLink } = file
      const formattedTime = moment(modifiedTime).format('YYYY MMM DD hh:mm:ss')
      const FileRow = styled.tr`
        cursor: pointer;
        img {
          margin-top: -5px;
        }
        &.active {
          color: white;
          font-weight: bold;
          td {
            background-color: #4285f4 !important;
          }
        }
      `
      return (
        <FileRow
          key={id}
          className={this.state.selectedFile.id === id ? 'active' : ''}
          onClick={ () => this.selectFile(id, name, mimeType, webContentLink, webViewLink)}
        >
          <td><img src={ iconLink }/> { name }</td>
          <td>{ formattedTime }</td>
        </FileRow>
      )
    })
  }

  downloadFile() {
    if (this.state.selectedFile
      && this.state.selectedFile.mimeType !== 'application/vnd.google-apps.folder') {
      open(this.state.selectedFile.webContentLink, '_blank')
    }
  }

  openExternal() {
    if (this.state.selectedFile.id) {
      open(this.state.selectedFile.webViewLink, '_blank')
    } else {
      const { folderId } = _.last(this.state.viewPath)
      Meteor.call(
        'drive.getFiles',
        { fileId: folderId },
        (error, result) => !error && open(result.webViewLink, '_blank')
      )
    }
  }

  deleteFile() {
    if (!this.state.selectedFile.id) return
    swal({
      title: 'Are you sure?',
      text: 'You won\'t be able to revert this!',
      type: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!'
    }).then(() => {
      Meteor.call('drive.removeFiles', { fileId: this.state.selectedFile.id }, error => {
        if (!error) {
          swal(
            'Deleted!',
            'Your file has been deleted.',
            'success'
          )
          const params = {
            ...this.slack,
            attachments: [
              {
                color: '#36a64f',
                text: `<Removed ${this.state.selectedFile.name}>`
              }
            ]
          }
          const slackText = `I just removed the file named as "${this.state.selectedFile.name}"`
          Meteor.call('sendBotMessage', this.slack.chanel, slackText, params)
          this.removeFileFromView(this.state.selectedFile.id)
        }
      })
    })
  }

  pickFile() {
    this.refs.uploader.pickFile()
  }

  addFileToView(file) {
    this.state.files.push(file)
    this.setState(prevState => prevState)
  }

  removeFileFromView(fileId) {
    this.state.files = this.state.files.filter(({ id }) => id !== fileId)
    if (this.state.selectedFile.id === fileId) this.state.selectedFile = {}
    this.setState(prevState => prevState)
  }

  createNewFile() {
    swal({
      title: 'Select New File Type',
      html: `
        <from class='form'>
          <div class='form-group'>
            <select class='form-control' id='select'>
              <option value='application/vnd.google-apps.folder'>Folder</option>
              <option value='application/vnd.google-apps.document'>Doc</option>
              <option value='application/vnd.google-apps.spreadsheet'>Spreadsheet</option>
              <option value='application/vnd.google-apps.presentation'>Slide</option>
              <option value='application/vnd.google-apps.drawing'>Drawing</option>
            </select>
          </div>
          <div class='form-group'>
            <input type='text' class='form-control' id='name' placeholder='Name of file/folder'/>
          </div>
        </form>
      `,
      preConfirm: () => new Promise((resolve, reject) => {
        const result = {
          name: $('#name').val(),
          filetype: $('#select option:selected').val(),
        }
        if (!result.name || !result.filetype)
          return reject('Name is required')
        resolve(result)
      })
    }).then(({name, filetype}) => {
      const parent = _.last(this.state.viewPath).folderId
      const file = {
        name,
        filetype,
        parent,
      }
      Meteor.call('drive.createFile', file, (error, file) => {
        if (!error) {
          this.state.files.push(file)
          this.setState(prevState => prevState)
          const params = {
            ...this.slack,
            attachments: [
              {
                color: '#36a64f',
                text: `<${file.webViewLink}|Go to file ${file.name}>`
              }
            ]
          }
          const slackText = `I just added new file named as '${file.name}'`
          Meteor.call('sendBotMessage', this.slack.chanel, slackText, params)
        }
      })
    })
  }

  render() {
    const { salesRecord, project } = this.props
    if (project) {
      const { _id, folderId, name } = project
      this.checkRemoteFolder({
        _id,
        type: 'project',
        folderId ,
        name,
      })
    }
    if (salesRecord) {
      const { _id, folderId, name } = salesRecord
      this.checkRemoteFolder({
        _id,
        type: 'salesRecord',
        folderId,
        name,
      })
    }
    return (
      <FileManager>
        <FileUploader
          ref='uploader'
          folderId={_.last(this.state.viewPath).folderId}
          addFileToView={this.addFileToView}
          slack={this.slack}
        />
        <div className='text-center'>
          <div className='btn-group'>
            <button className={`btn btn-default btn-sm fa fa-chevron-left ${this.state.viewPath.length <= 1 ? 'disabled' : ''}`} onClick={this.goBack}/>
            <button className='btn btn-default btn-sm fa fa-upload' onClick={this.pickFile}/>
            <button
              className={`btn btn-default btn-sm fa fa-download ${this.state.selectedFile.mimeType && this.state.selectedFile.mimeType !== 'application/vnd.google-apps.folder' ? '' : 'disabled'}`}
              onClick={this.downloadFile}
            />
            <button className={`btn btn-default btn-sm fa fa-trash ${!this.state.selectedFile.id ? 'disabled' : ''}`} onClick={this.deleteFile}/>
            <button className='btn btn-default btn-sm fa fa-file' onClick={this.createNewFile}/>
            <button
              className='btn btn-default btn-sm fa fa-external-link'
              onClick={this.openExternal}
            />
          </div>
        </div>
        <br/>
        <div>
          {
            (this.state.loading) ? (
              <LoadingIcon>
                <i className='fa fa-spinner fa-spin fa-3x fa-fw'/>
              </LoadingIcon>
            ) : ''
          }
          {
            this.renderViewPath()
          }
          <table className='table table-condensed table-hover'>
            <thead>
              <tr>
                <th>Name</th>
                <th>Last modified</th>
              </tr>
            </thead>
            <tbody>
            { this.renderFiles() }
            </tbody>
          </table>
        </div>
      </FileManager>
    )
  }
}

export default Files
