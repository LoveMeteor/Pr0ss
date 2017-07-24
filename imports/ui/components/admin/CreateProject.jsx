import React, { Component } from 'react';
import Select from 'react-select';
import { info, warning } from '/imports/api/lib/alerts';
import BlockUi from 'react-block-ui';
import 'react-block-ui/style.css';
import { Loader, Types } from 'react-loaders';
import 'loaders.css/loaders.min.css';
import {
    DESIGNATION_LIST,
    STAKEHOLDER_CATEGORY
} from '/imports/api/constants/project';

export default class CreateProject extends Component {
    constructor(props) {
        super(props);
        const curUserName = `${props.currentUser.profile.firstName} ${props.currentUser.profile.lastName}`;
        this.state = {
            projectName: '',
            selectedMembers: [
                {
                    label: curUserName,
                    value: props.currentUser._id
                }
            ],
            blocking: false
        }
        this.changeMembers = this.changeMembers.bind(this);
        this.changeState = this.changeState.bind(this);
        this.changeName = this.changeName.bind(this);
        this.addProject = this.addProject.bind(this);
    }

    addProject() {
        const project = {
            name: this.state.projectName,
            members: this.state.selectedMembers.map(({ label, value, checked })=> ({
                userId: value,
                isAdmin: !!checked,
            })),
        }
        this.props.toggleLoader(true)
        Meteor.call('createNewProject', project, (error, projectId)=> {
            //info(`Success add new project & integration with Slack`);
            this.props.toggleLoader(false)
            if (error) {
                warning(error.reason || error.message);
            } else {
                info(`Success add new project`);
                FlowRouter.go('Project', { id: projectId });
            }
        })
    }

    changeName(event) {
        this.setState({
            projectName: event.target.value,
        })
    }

    changeState(type, checked, member) {
        switch(type) {
            case 'isAdmin':
                if (!checked) return;
                this.state.selectedMembers.forEach((member)=> {
                    member.checked = false;
                });
                member.checked = true;
                this.setState((prevState)=> {
                    return prevState;
                })
                break;
        }

    }

    changeMembers(members) {
        const hasChecked = members.reduce((result, { label, value, checked })=> result || checked !== undefined, false);
        if (!hasChecked && members.length > 0) members[0].checked = true;
        this.setState({
            selectedMembers: members,
        })
    }

    render() {
        const memberOptions = this.props.users.map(({ profile: { firstName, lastName }, _id })=> {
            const name = `${firstName} ${lastName}`;
            return {
                label: name,
                value: _id,
            }
        });
        return (
            <div>
                <div className='form'>
                    <div className='form-group'>
                        <label> Project Name </label>
                        <input
                            type='text'
                            className='form-control'
                            value={this.state.projectName}
                            onChange={this.changeName}
                        />
                    </div>
                    <Select
                        multi
                        value={this.state.selectedMembers}
                        onChange={this.changeMembers}
                        options={memberOptions}
                        className={'members-select'}
                        clearable={false}
                    />
                    <table className='table table-condensed'>
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Admin</th>
                            </tr>
                        </thead>
                        <tbody>
                            {
                                this.state.selectedMembers.map((member)=> {
                                    const { value, label, checked } = member;
                                    return (
                                        <tr key={ value }>
                                            <td>{ label }</td>
                                            <td>
                                                <div className='radio'>
                                                    <label>
                                                        <input
                                                            type='checkbox'
                                                            checked={ checked }
                                                            onChange={(event)=> this.changeState('isAdmin', event.target.checked, member)}/>
                                                    </label>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            }
                        </tbody>
                    </table>
                    <div className='form-group text-center'>
                        <button className='btn btn-primary' onClick={this.addProject}>Add Project</button>
                    </div>
                </div>
            </div>
        );
    }
}
