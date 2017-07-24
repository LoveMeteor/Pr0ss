import React, {Component, PropTypes} from 'react'
import {DropdownButton, MenuItem} from 'react-bootstrap'
import Actions from '../../../../api/nylas/actions'
import AccountStore from '/imports/api/nylas/account-store'

export default class AttachActionButton extends React.Component {
    static displayName = 'AttachActionButton';

    static propTypes = {
        clientId: PropTypes.string.isRequired,
        draft: PropTypes.object
    };

    constructor(props) {
        super(props)
        this.state = {}

    }

    componentDidMount() {

    }

    componentWillReceiveProps(newProps) {

    }

    componentWillUnmount() {

    }

    _onSelectDesktop = () => {
        this.refs.fileUploader.click()
    }

    _onChangeFiles = (e) => {
        const {files} = e.target

        for(let i=0; i<files.length; i++) {
            const file = files[i]
            Actions.addAttachment({clientId: this.props.clientId, file})
        }
    }

    _onSelectGoogleDrive = () => {

    }


    _items() {
        return [{
            name: 'Desktop',
            image: '/icons/inbox/ic-provider-local.png',
            select: this._onSelectDesktop
        }, {
            name: 'GoogleDrive',
            image: '/icons/inbox/ic-provider-googledrive.png',
            select: this._onSelectGoogleDrive
        }]
    }

    render() {
        const items = this._items()

        return (
            <div style={{order: 50}}>
                <input type="file" id="file" ref="fileUploader" style={{display: 'none'}} multiple={true}
                       onChange={this._onChangeFiles}/>
                <DropdownButton bsStyle="default" bsSize="small" id="dropdown-attach-file"
                                title={<img src="/icons/inbox/icon-composer-attachment.png" width={16}/> }>
                    {
                        items.map((item, index) => (
                            <MenuItem key={`attach-file-${index}`} onSelect={item.select}><img src={item.image}
                                                                                               width={16}/>&nbsp;{item.name}
                            </MenuItem>))
                    }
                </DropdownButton>
            </div>
        )
    }
}
