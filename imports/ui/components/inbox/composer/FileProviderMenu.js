import _ from 'underscore'
import React, {Component, PropTypes} from 'react'
import PopoverActions from '../../popup/PopoverActions'
import Menu from '../../utils/Menu'


class FileProviderMenu extends Component {
    static displayName = 'FileProviderMenu';

    static propTypes = {
        onSelectProvider: PropTypes.func.isRequired
    };

    constructor(props) {
        //console.log("FileProviderPopover->constructor");
        super(props);

        const items = [];
        items.push({type:'local', title:'Desktop', id:'local-file-provider', icon:'/icons/inbox/ic-provider-local.png'});
        items.push({type:'separator', id:'divider-1'});
        items.push({type:'cloud', title:'GoogleDrive', id:'cloud-google-provider', icon:'/icons/inbox/ic-provider-googledrive.png'});



        this.items = items;
    }

    onEscape() {
        PopoverActions.closePopover();
    }

    onSelectMenuOption = (item)=> {
        PopoverActions.closePopover();
        this.props.onSelectProvider(item);
    };


    renderMenuOption(item) {
        if(item.type == 'separator')
            return (
                <Menu.Item divider={true} key={item.id}/>
            );
        else
            return (
                <div className="file-provider-option" key={item.id}>
                    <img src={item.icon} width={16} /> {item.title}
                </div>
            );
    }

    render() {

        const headerComponents = [
            <span key="file-provider-header">File Provider:</span>,
        ]

        return (
            <div className="file-provider-popover">
                <Menu
                    ref="menu"
                    items={this.items}
                    itemKey={item => item.id}
                    itemContent={this.renderMenuOption}
                    defaultSelectedIndex={-1}
                    headerComponents={headerComponents}
                    onEscape={this.onEscape}
                    onSelect={this.onSelectMenuOption} />
            </div>
        );
    }

}

export default FileProviderMenu
