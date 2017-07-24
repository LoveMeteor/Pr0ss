import React, {Component, PropTypes} from 'react'
import _ from 'underscore'
import {Button} from 'react-bootstrap'
import {BootstrapTable, TableHeaderColumn} from 'react-bootstrap-table'
import {info, warning} from '/imports/api/lib/alerts'
import {isValidEmail} from '/imports/api/lib/validation'
import {ROLES, USER_STATUS} from '/imports/api/models'
import 'react-bootstrap-table/dist/react-bootstrap-table-all.min.css'

class EditableUsersTable extends Component {
    constructor(props) {
        super(props)
    }

    customConfirm = (next, userIds) => {
        if (confirm(`(It's a custom confirm)Are you sure you want to delete ${userIds}?`)) {
            // If the confirmation is true, call the function that
            // continues the deletion of the record.
            Meteor.call('adminRemoveUser', userIds, (error) => {
                if (error) {
                    return warning(error.reason ? error.reason : error.error)
                }
                info('User was successfully removed!')
                next()
            })
        }
    }

    handleAddRowWithASyncError = (row, colInfo, cb) => {
        const userData = {
            firstName: row.firstName,
            lastName: row.lastName,
            username: row.username,
            email: row.email,
            role: row.role
        }
        Meteor.call('adminCreateUser', userData, (err) => {
            if (err) {
                cb('Error')
                return warning(err.reason ? err.reason : err.error)
            }
            cb()
            info('Successful create user!')
            Meteor.call('inviteUserToSlack', row.email, (err) => {
                if (err) return warning(err.reason ? err.reason : err.error)
                info('Successful invited user to Slack!')
            })
        })
        return false
    }

    onAfterSaveCell = (row) => {
        const userData = {
            firstName: row.firstName,
            lastName: row.lastName,
            role: row.role,
            status: row.status
        }

        Meteor.call('adminEditUser', row._id, userData, (err) => {
            if (err) return warning(err.reason ? err.reason : err.error)
            info('User was successfully edited!')
        })
    }

    onBeforeSaveCell = (row, cellName, cellValue) => {
        // You can do any validation on here for editing value,
        // return false for reject the editing
        let validationStatus = true

        const uniqueUsername = this.props.createdUsers.filter(person => {
            if (person.username !== cellValue) return true
        })
        const uniqueEmail = this.props.createdUsers.filter(person => {
            if (person.email !== cellValue) return true
        })
        if (!_.isEqual(this.props.createdUsers, uniqueUsername)) {
            validationStatus = false
        }

        if (!_.isEqual(this.props.createdUsers, uniqueEmail)) {
            validationStatus = false
        }
        return validationStatus
    }

    // validator function pass the user input value and row object. In addition, a bool return value is expected
    usernameValidator = (value) => {
        const response = {isValid: true, notification: {type: 'success', msg: '', title: ''}}
        const uniqueUsername = this.props.createdUsers.filter(person => {
            if (person.username !== value) return true
        })
        if (!value) {
            response.isValid = false
            response.notification.type = 'error'
            response.notification.msg = 'Value must be inserted'
            response.notification.title = 'Requested Value'
        } else if (!_.isEqual(this.props.createdUsers, uniqueUsername)) {
            response.isValid = false
            response.notification.type = 'error'
            response.notification.msg = 'Value must be unique'
            response.notification.title = 'Invalid Value'
        }
        return response
    }

    // validator function pass the user input value and row object. In addition, a bool return value is expected
    emailValidator = (value) => {
        const response = {isValid: true, notification: {type: 'success', msg: '', title: ''}}
        const uniqueUsername = this.props.createdUsers.filter(person => {
            if (person.email !== value) return true
        })
        if (!value) {
            response.isValid = false
            response.notification.type = 'error'
            response.notification.msg = 'Value must be inserted'
            response.notification.title = 'Requested Value'
        } else if (!_.isEqual(this.props.createdUsers, uniqueUsername)) {
            response.isValid = false
            response.notification.type = 'error'
            response.notification.msg = 'Value must be unique'
            response.notification.title = 'Invalid Value'
        } else if (!isValidEmail(value)) {
            response.isValid = false
            response.notification.type = 'error'
            response.notification.msg = 'Please check your email input'
            response.notification.title = 'Invalid Value'
        }
        return response
    }

    actionActiveUser = (cell, row) => {
        if(row.status === USER_STATUS.ACTIVE && row.slack) return 'Activated'

        return (<Button onClick={() => this.activeUser(row._id)} disabled={!row.slackInvited && !row.slack}>Active</Button>)
    }

    activeUser = (userId) => {
        Meteor.call('activeUser', userId, (err,res) => {
            if (err) return warning(err.reason ? err.reason : err.error)
            info('Successful activated user!')
        })
    }

    actionSlackInvite = (cell, row) => {
        if(row.slack) return row.slack.id
        if(row.slackInvited) return 'Invite sent'

        return (<Button onClick={() => this.inviteUserToSlack(row.email)}><i className="fa fa-slack"/> </Button>)
    }

    inviteUserToSlack = (email) => {
        Meteor.call('inviteUserToSlack', email, (err) => {
            if (err) return warning(err.reason ? err.reason : err.error)
            info('Successful invited user to Slack!')
        })
    }

    render() {
        const selectRowProp = {
            mode: 'checkbox',
            clickToSelect: true
        }
        const options = {
            handleConfirmDeleteRow: this.customConfirm,
            // afterInsertRow: this.onAfterInsertRow,
            ignoreEditable: true,
            onAddRow: this.handleAddRowWithASyncError,
        }
        const cellEditProp = {
            mode: 'click',
            blurToSave: true,
            beforeSaveCell: this.onBeforeSaveCell, // a hook for before saving cell
            afterSaveCell: this.onAfterSaveCell  // a hook for after saving cell
        }

        const userRoles = Object.values(ROLES)

        const createdUsers = this.props.createdUsers.map(({_id, username, profile: {firstName, lastName}, emails, roles = [], status, slackInvited, slack}) => ({
            _id,
            username,
            firstName,
            lastName,
            email: emails[0].address,
            role: roles[0],
            isActive: emails[0].verified,
            status,
            slackInvited,
            slack
        }))
        return (
            <BootstrapTable
                data={ createdUsers }
                insertRow={ true }
                pagination
                selectRow={ selectRowProp }
                deleteRow
                exportCSV
                cellEdit={ cellEditProp }
                options={ options }
            >
                <TableHeaderColumn
                    dataField='_id'
                    isKey={ true }
                    hidden
                    hiddenOnInsert
                    autoValue={ true }
                    editable={ false }
                >
                    User Id
                </TableHeaderColumn>

                <TableHeaderColumn
                    dataField='firstName'
                    dataSort={ true }>First Name
                </TableHeaderColumn>

                <TableHeaderColumn
                    dataField='lastName'
                    dataSort={ true }>Last Name
                </TableHeaderColumn>

                <TableHeaderColumn
                    dataField='username'
                    dataSort={ true }
                    editable={ false }
                >
                    Username
                </TableHeaderColumn>
                <TableHeaderColumn
                    dataField='email'
                    editable={false}
                    dataSort={ true }
                >
                    Email
                </TableHeaderColumn>
                <TableHeaderColumn
                    dataField='role'
                    dataSort={ true }
                    editable={ {type: 'select', options: {values: userRoles}} }
                >
                    Role
                </TableHeaderColumn>
                <TableHeaderColumn
                    dataField='status'
                    dataSort={ true }
                    dataFormat={ this.actionActiveUser }
                    editable={false}
                    hiddenOnInsert
                >
                    Status
                </TableHeaderColumn>
                <TableHeaderColumn dataFormat={ this.actionSlackInvite } editable={false}>
                    Slack Invite
                </TableHeaderColumn>
            </BootstrapTable>
        )
    }
}

EditableUsersTable.propTypes = {
    createdUsers: PropTypes.array.isRequired,
}

export default  EditableUsersTable
