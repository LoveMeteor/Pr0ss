import React, { Component, PropTypes } from 'react'
import MediaUploader from '../../libs/MediaUploader'
import { ProgressBar } from 'react-bootstrap'
import swal from 'sweetalert2'
import 'sweetalert2/dist/sweetalert2.min.css'

class UploadOverlay extends Component {
  constructor() {
    super()
    this.state = {
      overlay: 'none',
      loadedPercentage: 10,
    }
  }

  componentDidMount() {
    const taskElem = $('.task-details .modal-content')[0]
    Meteor.call('drive.getAccessToken', {}, (error, token) => {
      if (error) {
        return swal('Google Drive', 'could not connect to google drive to attach files to current task', 'error')
      } else {
        taskElem.onpaste = (event) => {
          const files = []
          const items = event.clipboardData.items
          for (let i = 0; i < items.length; i++) {
            const item = items[i]
            if (item.kind === 'file') {
              files.push(item.getAsFile())
            }
          }

          const dropEvent = new $.Event({ type: 'drop', files })
          $(taskElem).trigger('dragenter')
          $(taskElem).trigger(dropEvent)
        }

        taskElem.ondrop = (event) => {
          let files = null
          if (event.dataTransfer) {
            // original upload file
            event.preventDefault()
            files = event.dataTransfer.files
          } else {
            // trigger upload file from other component
            files = event.originalEvent.files
          }

          const percentages = []
          const completedFiles = []
          let completedSize = 0
          let hasShowError = false
          const willUploadFiles = _.toArray(files).filter(f => !(!f.type && f.size % 4096 == 0))
          if (willUploadFiles.length === 0) {
            return this.setState({ overlay: 'none', loadedPercentage: 10 })
          }

          _.forEach(willUploadFiles, (file, index) => {
            const uploader = new MediaUploader({
              file,
              token,
              metadata: {
                parents: [this.props.taskFolderId],
              },
              onProgress: ({ loaded, total }) => {
                const percentage = Math.round(loaded/total * 100)
                percentages[index] = percentage
                const totalPercentage = percentages.reduce((sum, next) => (sum + next), 0)/willUploadFiles.length
                if (totalPercentage > 10) {
                  this.setState({ loadedPercentage: totalPercentage })
                }
              },

              onComplete: (remoteFile) => {
                completedSize++
                completedFiles.push(JSON.parse(remoteFile))
                if (completedSize === willUploadFiles.length) {
                  this.setState({ overlay: 'none', loadedPercentage: 10 })
                  Meteor.call('task.attachFiles', {
                    _id: this.props.taskId,
                    attachments: completedFiles.map(({ id, name, mimeType }) => ({ _id: id, name, mimeType })),
                  }, error => {
                    if (error) {
                      const msg = error.reason ? error.reason : error.message
                      if (!hasShowError) {
                        hasShowError = true
                        swal('Attachment', msg, 'error')
                      }
                    }
                  })
                }
              },

              onError: (error) => {
                const { error: { message } } = JSON.parse(error)
                if (!hasShowError) {
                  hasShowError = true
                  swal('Attachment', message, 'error')
                  this.setState({ overlay: 'none', loadedPercentage: 10 })
                }
              },
            })
            uploader.upload()
          })
        }
      }
    })

    taskElem.ondragover = (event) => {
      event.preventDefault()
    }

    taskElem.ondragenter = () => {
      this.setState({
        overlay: '',
        loadedPercentage: 10,
      })
    }

  }

  render() {
    return (
      <div
        className='attachment-overlay'
        style={{ display: this.state.overlay }}
        onDrop={event => event.preventDefault()}>
        <p>Upload Files</p>
        <ProgressBar bsStyle='success' now={this.state.loadedPercentage}/>
      </div>
    )
  }
}

UploadOverlay.propTypes = {
  taskFolderId: PropTypes.string,
  taskId: PropTypes.string.isRequired,
}

export default UploadOverlay
