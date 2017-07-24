import React, { Component } from 'react';
import { createContainer  } from 'meteor/react-meteor-data';
import { GET_NEW_PROJECTS } from '/imports/api/constants/collections';
import Projects from '/imports/api/models/projects/projects';
import Sheets from '/imports/ui/components/libs/Sheets';
import swal from 'sweetalert2';
import 'sweetalert2/dist/sweetalert2.min.css';

class AllProjects extends Component {
    constructor(props) {
        super(props);
        this.possibleColumns = [
            {
                key: '_id',
                label: 'ID',
                type: 'text',
                selected: false,
                editable: false,
            }, {
                key: 'name',
                label: 'Name',
                type: 'text',
                selected: false,
                editable: true,
            },
        ];
        this.saveProjectProperty = this.saveProjectProperty.bind(this);
        this.removeProject = this.removeProject.bind(this);
    }

    componentWillUnmount() {
        this.props.subscribers.forEach((subscriber)=> subscriber.stop());
    }

    saveProjectProperty(projectId, { key, value }, callback) {
        Meteor.call('updateNewProjectProperty', projectId, { key, value }, (error)=> {
            if (error) {
                error.reason = `Problems with updating project. ${error.error}`
                callback && callback(error);
            } else {
                callback && callback(null, 'Success update project attributes')
            }
        });
    }

    removeProject({ _id }) {
      swal({
        title: 'Are you sure ?',
        type: 'warning',
        html: `
          <div class='form-group text-left'>
            <div class='checkbox'>
              <label>
                <input type='checkbox' checked id='confirm-remove-folders'/> Remove resource folders
              </label>
            </div>
            <div class='checkbox'>
              <label>
                <input type='checkbox' checked id='confirm-remove-slack'/> Remove slack channel
              </label>
            </div>
          </div>
        `,
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, remove it!',
        preConfirm: ()=> {
          return new Promise((resolve)=> {
            resolve({
              isRemoveFolders: $('#confirm-remove-folders').is(':checked'),
              isRemoveSlack: $('#confirm-remove-slack').is(':checked'),
            });
          });
        },
      }).then(({ isRemoveFolders, isRemoveSlack })=> {
        Meteor.call('removeProject', { _id, isRemoveFolders, isRemoveSlack }, (error, result)=> {
          if (error) {
            const msg = error.reason ? error.reason : error.message;
            return swal('remove project failed',  msg, 'warning');
          }
          swal(
            'Removed!',
            'Project has been removed.',
            'success'
          );
        });
      })
    }

    goTo(project) {
        FlowRouter.go('Project', {id: project._id})
    }

    render() {
        return (
            <div>
            {
                (this.props.loading) ? (
                    <div>Loading ...</div>
                ) : (
                    <Sheets
                        rows={this.props.projects}
                        columns={this.possibleColumns}
                        onSave={this.saveProjectProperty}
                        settingKey={'newProject'}
                        goTo={this.goTo}
                        remove={this.removeProject}
                    />
                )
            }
            </div>
        )
    }
}

export default createContainer(function() {
    const subscribers = [];
    subscribers.push(Meteor.subscribe(GET_NEW_PROJECTS));
    return {
        subscribers,
        loading: !subscribers.reduce((prev, subscriber)=> prev && subscriber.ready(), true),
        projects: Projects.find().fetch(),
    };
}, AllProjects);
