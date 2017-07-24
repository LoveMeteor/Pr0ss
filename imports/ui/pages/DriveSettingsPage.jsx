import React, { Component } from 'react'
import { createContainer } from 'meteor/react-meteor-data'
import styled from 'styled-components'
import picker from 'meteor/picker'
import swal from 'sweetalert2'
import { Roles } from 'meteor/alanning:roles'
import Settings from '/imports/api/models/settings/settings'
import {ROLES} from '/imports/api/models'
import 'sweetalert2/dist/sweetalert2.min.css'

const ContentWrapper = styled.div `
  background-color: white;
  padding: 20px 30px;
  min-height: 300px;
`

class DriveSettingsPage extends Component {
  constructor() {
    super()
    picker.then(p => this.picker = p)
    this.updateFolder = this.updateFolder.bind(this)
    this.openFolder = this.openFolder.bind(this)
  }

  componentWillUnMount() {
    this.props.subs.forEach(sub => sub.stop())
  }

  updateFolder(key) {
    this.picker.pick(({ docs }) => {
      const value = docs[0].id
      Meteor.call('settings.update', { key, value }, error => {
        if (!error) return
        swal('Update Settings', error.reason || error.message, 'error')
      })
    })
  }

  openFolder(key, value) {
    Meteor.call('drive.getFiles', { fileId: value }, (error, { webViewLink }) => {
      error && swal('Update Settings', error.reason || error.message, 'error')
      !error && window.open(webViewLink, '_blank')
    })
  }

  render() {
    const folderSettings = this
      .props
      .settings
      .filter(({ key }) => [
        'PROJECT_ROOT_FOLDER',
        'DEAL_ROOT_FOLDER',
        'PROJECT_TEMPLATE_FOLDER',
        'DEAL_TEMPLATE_FOLDER'
      ].includes(key))


    if (!Roles.userIsInRole(Meteor.userId(), ROLES.ADMIN)) return (
      <p className='text-center'>Access Denied</p>
    )

    return (
      <ContentWrapper>
        <div className='panel panel-default'>
          <div className='panel-heading'>Folder Selection</div>
          <div className='panel-body'>
            <table className='table table-condensed'>
              <thead>
                <tr>
                  <th>Key</th>
                  <th>Folder Id</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {
                  folderSettings.map(({ key, value }) =>
                    (
                      <tr key={key}>
                        <td>{ key }</td>
                        <td>{ value }</td>
                        <td>
                          <div className='btn-group'>
                            <button className='btn btn-default btn-sm' onClick={() => this.updateFolder(key, value)}>
                              <i className='fa fa-folder-o'/> Update
                            </button>
                            <button className='btn btn-default btn-sm' onClick={() => this.openFolder(key, value)}>
                              <i className='fa fa-external-link'/> Open
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  )
                }
              </tbody>
            </table>
          </div>
        </div>
      </ContentWrapper>
    )
  }
}

export default createContainer(() => {
  const subs = []
  subs.push(Meteor.subscribe('settings.all'))
  return {
    subs,
    settings: Settings.find().fetch(),
  }
}, DriveSettingsPage)
