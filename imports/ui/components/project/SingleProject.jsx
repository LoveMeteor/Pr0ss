import React, { Component } from 'react';
import { createContainer  } from 'meteor/react-meteor-data';
import classNames from 'classnames';
import Projects from '/imports/api/models/projects/projects';
import { GET_NEW_PROJECT } from '/imports/api/constants/collections';
import Activities from './Activities';
import Tasks from '../tasks/TaskBoard.jsx';
import Files from '../files/Files.jsx';

class SingleProject extends Component {
  constructor(props) {
    super(props);
    const projectId = FlowRouter.getParam('id');
    this.tabs = [
      {
        label: 'Activity',
        component: <Activities projectId={projectId}/>
      },
      {
        label: 'Tasks',
        component: <Tasks projectId={projectId}/>
      },
      {
        label: 'Files',
        component: <Files type='project'/>
      },
    ];

    this.state = {
      activeTab: this.tabs.find(tab=>tab.label === 'Activity'),
      showPopup: false,
      popupData: null,
      selectUser: null,
      selectedCategory: [],
      selectedDesignation: null,
    }
  }


  toggleTab(activeTab){
    this.setState({activeTab})
  }

  getTabs(){
    const { activeTab } = this.state;

    return <ul>
      {this.tabs.map(item=>{
        return (
          <li key={item.label}
              onClick={this.toggleTab.bind(this, item)}
              className={classNames({"active": item === activeTab})}
          >{item.label}</li>
        )
      })}
    </ul>
  }

  getContent(){
    const { activeTab } = this.state;
    if(activeTab.component){
      return React.cloneElement(activeTab.component, this.props);
    }else{
      return activeTab.content
    }
  }

  render() {
    return (
      <div className='page-container single-project'>
          <div className="main-content">
            {
                (this.props.loading) ? (
                  <div>Loading ...</div>
                ) : (
                  <div className='tab-container'>
                      <h2 className='page-title'>{this.props.project.name}</h2>
                      <div className='tab-controls'>
                        {this.getTabs()}
                      </div>
                      <div className='tab-content'>
                        {this.getContent()}
                      </div>
                  </div>
                )
            }
          </div>
      </div>
    )
  }
}

export default createContainer(()=> {
    const projectId = FlowRouter.getParam('id');
    const subscribers = [];
    subscribers.push(Meteor.subscribe(GET_NEW_PROJECT, projectId));
    return {
        loading: !subscribers.reduce((prev, subscriber)=> prev && subscriber.ready(), true),
        project: Projects.find(projectId).fetch()[0],
    };
}, SingleProject);
