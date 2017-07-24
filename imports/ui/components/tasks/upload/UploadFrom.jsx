import React, { Component, PropTypes } from 'react'

class UploadFrom extends Component {
  static propTypes = {
    close: PropTypes.func.isRequired,
    taskFolderId: PropTypes.string.isRequired,
    taskId: PropTypes.string.isRequired,
  }
  constructor() {
    super()
    this.pickLocalFile = this.pickLocalFile.bind(this)
    this.uploadFromLocal = this.uploadFromLocal.bind(this)
    this.createGoogleFile = this.createGoogleFile.bind(this)
    this.state = {
      show: false,
    }
  }

  createGoogleFile(subType) {
    this.setState({ show: true })
    this.props.close()
    const { taskFolderId, taskId } = this.props
    const name = prompt('File Name')
    if (name) {
      const filetype = `application/vnd.google-apps.${subType}`
      const file = {
        name,
        filetype,
        parent: taskFolderId,
      }
      Meteor.call('drive.createFile', file, (error, { id, name, mimeType }) => {
        if (!error) {
          Meteor.call('task.attachFiles', {
            _id: taskId,
            attachments:  [{ _id: id, name, mimeType }],
          }, error => error && console.log(error))
        }
      })
    }
  }

  uploadFromLocal(event) {
    const modalElem = $('.task-details .modal-content')
    const dropEvent = new $.Event({ type: 'drop', files: event.target.files })
    this.props.close()
    modalElem.trigger('dragenter')
    modalElem.trigger(dropEvent)
  }

  pickLocalFile() {
    event.preventDefault()
    this.refs.file.click()
  }

  render() {
    return (
      <div className='upload-from'>
        <p className='text-center'>
          Upload From ...
          <a href='#' className='pull-right' onClick={() => this.props.close()}>
            <i className='fa fa-times'/>
          </a>
        </p>
        <div className='form'>
          <div className='form-group'>
            <input type='file' className='hide' ref='file' onChange={this.uploadFromLocal}/>
            <button className='upload-option' onClick={this.pickLocalFile}>
              Computer
            </button>
          </div>
          <div className='form-group'>
            <button className='upload-option' onClick={() => this.createGoogleFile('document')}>
              Google Doc
            </button>
          </div>
          <div className='form-group'>
            <button className='upload-option' onClick={() => this.createGoogleFile('spreadsheet')}>
              Google SpreadSheet
            </button>
          </div>
          <div className='form-group'>
            <button className='upload-option' onClick={() => this.createGoogleFile('presentation')}>
              Google Slide
            </button>
          </div>
          <div className='form-group'>
            <button className='upload-option' onClick={() => this.createGoogleFile('drawing')}>
              Google Drawing
            </button>
          </div>
        </div>
      </div>
    )
  }
}

export default UploadFrom
