import React from 'react';
import {FlowRouter} from 'meteor/kadira:flow-router';
import classNames  from 'classnames';
import { getUserName, getAvatarUrl } from '/imports/api/lib/filters';

class Header extends React.Component{
    constructor(props){
        super(props);

    }

    logout(){
        Meteor.logout((err)=>{
            if(!err) {
                FlowRouter.reload();
            }
        })
    }

    render() {
        const { user } = this.props;
        return (
            <div className={classNames("header-wrap", {"hide": !user})}>
                <header className="header">
                    <div className="user-info">
                        <div className="avatar">
                            <img src={getAvatarUrl(user)} alt={getUserName(user, true)}/>
                        </div>
                        <div className="username">{getUserName(user, true)}</div>
                        <div className="logout">
                            <button className="logout-btn"
                                onClick={this.logout.bind(this)}/>
                        </div>
                    </div>
                </header>
            </div>
        )
    }
}
export default Header;