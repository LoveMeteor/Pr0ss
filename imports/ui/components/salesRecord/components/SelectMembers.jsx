import _ from 'underscore'
import React, { Component, PropTypes } from 'react'
import Select from 'react-select'

class SelectMembers extends Component{
    constructor(props) {
        super(props)


        const selectedMembers = [
            {
                label: Meteor.user().name(),
                value: Meteor.userId(),
                username: Meteor.user().username,
                roles: Meteor.user().roles.join(', ')
            }
        ]
        this.state = {
          selectedMembers
        }

        if(this.props.onSelectMembers) {
            this.props.onSelectMembers(_.pluck(selectedMembers, 'value'))
        }
    }

    changeMembers = (selectedMembers) => {
        this.setState({ selectedMembers})
        this.props.onSelectMembers(_.pluck(selectedMembers, 'value'))
    }

    renderMembers() {
        return (
            <table className='table table-condensed'>
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Username</th>
                        <th>Role</th>
                    </tr>
                </thead>
                <tbody>
                    {
                        this.state.selectedMembers.map((member) => {
                            const { label, value, username, roles } = member
                            return (
                                <tr key={value}>
                                    <td>{ label }</td>
                                    <td>{ username }</td>
                                    <td>{ roles }</td>
                                </tr>
                            )
                        })
                    }
                </tbody>
            </table>
        )
    }

    render() {
        const memberOptions = this.props.members.map(member => ({ label: member.name(), value: member._id, username: member.username, roles:member.roles.join(',') }))
        return (
            <div className='panel panel-default'>
                <div className='panel-heading'>
                    Add Members
                </div>
                <div className='panel-body'>
                    <label>Members</label>
                    <Select
                        multi
                        value={this.state.selectedMembers}
                        onChange={this.changeMembers}
                        options={memberOptions}
                        className={'members-select'}
                    />
                    <div>
                        { this.renderMembers() }
                    </div>
                </div>
            </div>
        )
    }
}

SelectMembers.propTypes = {
    members: PropTypes.array.isRequired,
    onSelectMembers: PropTypes.func.isRequired,
}
export default SelectMembers
