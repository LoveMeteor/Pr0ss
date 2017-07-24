import React, { Component } from 'react';
import classNames from 'classnames';
import AllProjects from '../components/project/AllProjects';
import CreateProject from '/imports/ui/components/admin/CreateProject';

export default class ProjectsPage extends Component {
    constructor(props){
        super(props);
        this.tabs = [
            {
                label: 'All Projects',
                component: <AllProjects/>
            },
            {
                label: 'Add Project',
                component: <CreateProject/>
            }
        ];
        this.state ={
            activeTab: this.tabs[0]
        }
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

    toggleTab(activeTab){
        this.setState({activeTab})
    }

    getContent(){
        const { activeTab } = this.state;
        if(!activeTab.component) return null;
        return React.cloneElement(activeTab.component, this.props)
    }

    render() {
        return (
            <div className="projects-page">
                <div className="tab-container">
                    <div className="tab-controls">
                        {this.getTabs()}
                    </div>
                    <div className="tab-content">
                        {this.getContent()}
                    </div>
                </div>
            </div>
        )
    }
}
