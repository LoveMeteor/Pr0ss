import React, { Component, PropTypes } from 'react'
import swal from 'sweetalert2'
import moment from 'moment'
import 'sweetalert2/dist/sweetalert2.min.css'

class Attachments extends Component {
  constructor() {
    super()
    this.downloadFile = this.downloadFile.bind(this)
    this.deleteFile = this.deleteFile.bind(this)
  }

  downloadFile(fileId, event) {
    event.preventDefault()
    Meteor.call('drive.getFiles', { fileId }, (error, result) => {
      if (error) {
        const msg = error.reason ? error.reason : error.message
        swal('Attachments', msg, 'error')
      } else {
        const link = result.webContentLink || result.webViewLink
        window.open(link, '_blank')
      }
    })
  }

  deleteFile(fileId, event) {
    event.preventDefault()
    swal({
      title: 'Are you sure?',
      text: 'You won\'t be able to revert this!',
      type: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!',
    }).then(() => {
      Meteor.call('task.removeAttachment', { fileId, _id: this.props.taskId }, (error) => {
        if (error) {
          const msg = error.reason ? error.reason : error.message
          swal('Attachments', msg, 'error')
        } else {
          swal(
            'Deleted!',
            'Your file has been deleted.',
            'success'
          )
        }
      })
    })
  }

  render() {
    return (
      <div className='hide'>
        <p>
          <strong><i className='fa fa-paperclip'/>&nbsp;&nbsp;&nbsp;Attachments</strong>
        </p>
        <div className='attachments'>
          {
            this.props.attachments.map(({ mimeType, name, _id, createdAt }) =>
              (
                <div className='attachment' key={_id}>
                  <div className='attachment-icon'>
                    { _.last(mimeType.split('/')) }
                  </div>
                  <div className='attachment-payload'>
                    <div className='attachment-header'>
                    { name }
                    </div>
                    <div className='attachment-time'>
                      Added At { moment(createdAt).format('MMM DD YYYY HH:mm:ss') }
                    </div>
                    <div className='attachment-controls'>
                      <button className='attachment-control'>
                        <a href='#' onClick={event => this.downloadFile(_id, event)}><i className='fa fa-download'/> Download</a>
                      </button>
                      <button className='attachment-control'>
                        <a href='#' onClick={event => this.deleteFile(_id, event)}><i className='fa fa-times'/> Delete</a>
                      </button>
                    </div>
                  </div>
                </div>
              )
            )
          }
        </div>
      </div>
    )
  }
}

Attachments.propTypes = {
  attachments: PropTypes.array,
  taskId: PropTypes.string.isRequired,
}

export default Attachments
