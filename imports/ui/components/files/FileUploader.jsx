import React, { Component } from 'react'
import MediaUploader from '../libs/MediaUploader'
import PropTypes from 'prop-types'
import { warning } from '/imports/api/lib/alerts'
import {
  getSlackUsername,
  getAvatarUrl
} from '../../../api/lib/filters'

class FileUploader extends Component {
  constructor() {
    super()
    this.state = {
      percentage: 0,
    }
    this.pickFile = this.pickFile.bind(this)
    this.uploadFile = this.uploadFile.bind(this)
  }

  componentDidMount() {
    Meteor.call('drive.getAccessToken', {}, (error, token) => {
      if (error) return warning('could not connect to google drive')
      this.token = token
    })
  }

  uploadFile(event) {
    const file = event.target.files[0]
    if (!file) return
    new MediaUploader({
      file,
      token: this.token,
      metadata: {
        parents: [this.props.folderId],
      },
      params: {
        fields: '*'
      },
      onProgress: ({ loaded, total }) => this.setState({ percentage: Math.round(loaded/total*100) }),
      onComplete: (remoteFile) => {
        remoteFile = JSON.parse(remoteFile)
        this.props.addFileToView(remoteFile) || this.setState({ percentage: 0 })
        const params = {
          ...this.props.slack,
          attachments: [
            {
              color: '#36a64f',
              text: `<${remoteFile.webViewLink}|Go to file ${remoteFile.name}>`
            }
          ]
        }
        const slackText = 'I just uploaded new file'
        Meteor.call('sendBotMessage', this.props.slack.chanel, slackText, params)
        this.refs.file.value = ''
      }
    }).upload()
    this.refs.file.value = ''
  }

  pickFile() {
    this.refs.file.click()
  }

  render() {
    return (
      <div>
        {
          (this.state.percentage) ? (
            <div className='progress'>
              <div
                className='progress-bar'
                aria-valuemin='0'
                aria-valuemax='100'
                style={{width: `${this.state.percentage}%`}}
              >
               { this.state.percentage } %
              </div>
            </div>
          ) : ''
        }
        <input type='file' ref='file' className='hide' onChange={this.uploadFile}/>
      </div>
    )
  }
}

FileUploader.propTypes = {
  folderId: PropTypes.string.isRequired,
  addFileToView: PropTypes.func.isRequired,
  slack: PropTypes.object.isRequired,
}

export default FileUploader
