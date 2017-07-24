import React from 'react';
import classNames from 'classnames';
import { getUserRoles, getUserEmail } from '../../../api/lib/filters';
import Alert from 'react-s-alert';
import BlockUi from 'react-block-ui';
import 'react-block-ui/style.css';
import { Loader, Types } from 'react-loaders';
import 'loaders.css/loaders.min.css';

class ContactInfo extends React.Component{
    constructor(props){
        super(props);
        this.state = {
            username: props.user.username,
            firstName: props.user.profile.firstName || '',
            lastName: props.user.profile.lastName || '',
            roles: props.roles,
            twitter:  props.user.profile.twitter || '',
            facebook:  props.user.profile.facebook || '',
            linkedIn:  props.user.profile.linkedIn || '',
            companyName:  props.user.profile.companyName || '',
            companyPosition:  props.user.profile.companyPosition || '',
            editCompanyPosition: false,
            editCompanyName: false,
            editLinkedIn: false,
            editFacebook: false,
            editTwitter: false,
            editUsername: false,
            editFirstName: false,
            editLastName: false,
            blocking: false
        }

    }

    toggleEditMode(stateName, event){
        if(!this.props.editable) return;

        event.persist();
        this.setState({[stateName]: true});
        //focus after click
        setTimeout(()=>{
            if(event.target.classList.contains('value')){
                event.target.parentElement.querySelector('input').focus();
            }else{
                event.target.parentElement.parentElement.querySelector('input').focus();
            }
        },0)
    }

    hide(){
        const { hide } = this.props;
        if(typeof hide === 'function'){hide()}
    }

    changeValue(stateName, event ){
        if(!this.props.editable) return;

        this.setState({[stateName]: event.target.value})
    }
    blur(stateName){
        this.setState({[stateName]: false})
    }

    updateUserInfo(){
        const { editable, user } = this.props;
        if(!editable) return;

        const { username, firstName, lastName, twitter, facebook, linkedIn, companyName, companyPosition} = this.state;
        const userData = {
            userId: user._id,
            username,
            firstName,
            lastName,
            twitter,
            facebook,
            linkedIn,
            companyName,
            companyPosition
        };
        this.props.toggleLoader(true);
        Meteor.call("updateUserInfo", userData, (err)=>{
            this.props.toggleLoader(false)
            if(!err) {
                Alert.info(`Contact data successful updated!`, {
                    position: 'bottom-right',
                    effect: 'bouncyflip',
                    timeout: 5000
                });
                this.hide();
            }else{
                Alert.warning(`Cannot update data, try again!`, {
                    position: 'bottom-right',
                    effect: 'bouncyflip',
                    timeout: 5000
                });
            }
        })
    }

    renderUpdateBtn(){
        const { editable } = this.props;
        if(editable)
            return(
                <button onClick={this.updateUserInfo.bind(this)}
                        className="btnn primary-btn">Update info</button>
            )
    }

    render() {
        const { firstName, lastName, username, twitter, facebook, linkedIn,companyName,
            companyPosition,
            editUsername, editFirstName, editLastName, editTwitter, editFacebook, editLinkedIn, editCompanyName,
            editCompanyPosition} = this.state;
        const { user, editable } = this.props;

        return (
           <div className="contact-info">
               <div className={classNames("field-wrap", {"non-edit": !editable})}>
                   <span className="label">Username</span>
                   <input value={username}
                          onBlur={this.blur.bind(this, 'editUsername')}
                          onChange={this.changeValue.bind(this, 'username')}
                          className={classNames({"show": editUsername})}
                          type="text"/>
                   <span onClick={this.toggleEditMode.bind(this, 'editUsername')}
                         className={classNames("value",{"hide": editUsername})}>
                       {username}
                   </span>
               </div>
               <div className="field-wrap non-edit">
                   <span className="label">Email</span>
                   <span className={classNames("value")}>
                       {getUserEmail(user)}
                   </span>
               </div>
               <div className={classNames("field-wrap", {"non-edit": !editable})}>
                   <span className="label">Firs name</span>
                   <input value={firstName}
                          onBlur={this.blur.bind(this, 'editFirstName')}
                          onChange={this.changeValue.bind(this, 'firstName')}
                          className={classNames({"show": editFirstName})}
                          type="text"/>
                   <span onClick={this.toggleEditMode.bind(this, 'editFirstName')}
                         className={classNames("value",{"hide": editFirstName})}>
                       {firstName || <i className="fa fa-plus-circle"/>}
                   </span>
               </div>
               <div className={classNames("field-wrap", {"non-edit": !editable})}>
                   <span className="label">Last name</span>
                   <input value={lastName}
                          onBlur={this.blur.bind(this, 'editLastName')}
                          onChange={this.changeValue.bind(this, 'lastName')}
                          className={classNames({"show": editLastName})}
                          type="text"/>
                   <span onClick={this.toggleEditMode.bind(this, 'editLastName')}
                         className={classNames("value",{"hide": editLastName})}>
                       {lastName || <i className="fa fa-plus-circle"/>}
                   </span>
               </div>

               <div className="group-wrap">
                   <h4 className="title">Socials</h4>
                   <div className={classNames("field-wrap", {"non-edit": !editable})}>
                       <span className="label">Twitter</span>
                       <input value={twitter}
                              onBlur={this.blur.bind(this, 'editTwitter')}
                              onChange={this.changeValue.bind(this, 'twitter')}
                              className={classNames({"show": editTwitter})}
                              type="text"/>
                       <span onClick={this.toggleEditMode.bind(this, 'editTwitter')}
                             className={classNames("value",{"hide": editTwitter})}>
                       {twitter || <i className="fa fa-plus-circle"/>}
                   </span>
                   </div>
                   <div className={classNames("field-wrap", {"non-edit": !editable})}>
                       <span className="label">Facebook</span>
                       <input value={facebook}
                              onBlur={this.blur.bind(this, 'editFacebook')}
                              onChange={this.changeValue.bind(this, 'facebook')}
                              className={classNames({"show": editFacebook})}
                              type="text"/>
                       <span onClick={this.toggleEditMode.bind(this, 'editFacebook')}
                             className={classNames("value",{"hide": editFacebook})}>
                       {facebook || <i className="fa fa-plus-circle"/>}
                  </span>
                   </div>
                   <div className={classNames("field-wrap", {"non-edit": !editable})}>
                       <span className="label">LinkedIn</span>
                       <input value={linkedIn}
                              onBlur={this.blur.bind(this, 'editLinkedIn')}
                              onChange={this.changeValue.bind(this, 'linkedIn')}
                              className={classNames({"show": editLinkedIn})}
                              type="text"/>
                       <span className={classNames("value",{"hide": editLinkedIn})}
                             onClick={this.toggleEditMode.bind(this, 'editLinkedIn')}>
                            {linkedIn || <i className="fa fa-plus-circle"/>}
                        </span>
                   </div>
               </div>

               <div className="role field-wrap non-edit">
                   <span className="label">Role</span>
                   <span className={classNames("value")}>
                       {getUserRoles(user)}
                   </span>
               </div>
               <div className="group-wrap">
                   <h4 className="title">Company</h4>
                   <div className={classNames("field-wrap", {"non-edit": !editable})}>
                       <span className="label">Name</span>
                       <input value={companyName}
                              onBlur={this.blur.bind(this, 'editCompanyName')}
                              onChange={this.changeValue.bind(this, 'companyName')}
                              className={classNames({"show": editCompanyName})}
                              type="text"/>
                       <span className={classNames("value",{"hide": editCompanyName})}
                             onClick={this.toggleEditMode.bind(this, 'editCompanyName')}>
                            {companyName || <i className="fa fa-plus-circle"/>}
                        </span>
                   </div>
                   <div className={classNames("field-wrap", {"non-edit": !editable})}>
                       <span className="label">Position</span>
                       <input value={companyPosition}
                              onBlur={this.blur.bind(this, 'editCompanyPosition')}
                              onChange={this.changeValue.bind(this, 'companyPosition')}
                              className={classNames({"show": editCompanyPosition})}
                              type="text"/>
                       <span className={classNames("value",{"hide": editCompanyPosition})}
                             onClick={this.toggleEditMode.bind(this, 'editCompanyPosition')}>
                            {companyPosition || <i className="fa fa-plus-circle"/>}
                        </span>
                   </div>
               </div>

               {this.renderUpdateBtn()}
           </div>
        )
    }
}

export default  ContactInfo;
