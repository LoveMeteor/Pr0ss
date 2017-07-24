import _ from 'underscore';
import React from 'react';
import ReactDOM from 'react-dom';
import classNames from 'classnames';
//import DOMUtils from '../../utils/dom-utils'

class MenuItem extends React.Component {
    static propTypes = {
        divider: React.PropTypes.oneOfType([React.PropTypes.string, React.PropTypes.bool]),
        selected: React.PropTypes.bool,
        checked: React.PropTypes.bool
    }

    render() {
        if (this.props.divider) {
            dividerLabel = _.isString(this.props.divider) ? this.props.divider : ''
            return (
                <div className="item divider">
                    {dividerLabel}
                </div>
            )
        }
        else {
            className = classNames({
                "item": true,
                "selected": this.props.selected,
                "checked": this.props.checked
            })
            return (
                <div className={className} onMouseDown={this.props.onMouseDown}>
                    {this.props.content}
                </div>
            )
        }
    }
}

class MenuNameEmailItem extends React.Component {
    static propTypes = {
        name: React.PropTypes.string,
        email: React.PropTypes.string
    }

    render() {
        if (props.name && props.name.length > 0 && this.props.name != this.props.email)
            return (
                <span>
                    <span className="primary">{this.props.name}</span>
                    <span className="secondary">{`(${this.props.email})`}</span>
                </span>
            )
        else
            <span className="primary">{this.props.email}</span>
    }
}

class Menu extends React.Component {
    static propTypes = {
        className: React.PropTypes.string,
        footerComponents: React.PropTypes.arrayOf(React.PropTypes.element),
        headerComponents: React.PropTypes.arrayOf(React.PropTypes.element),
        itemContent: React.PropTypes.func.isRequired,
        itemKey: React.PropTypes.func.isRequired,
        itemChecked: React.PropTypes.func,
        items: React.PropTypes.array.isRequired,
        onSelect: React.PropTypes.func.isRequired,
        onEscape: React.PropTypes.func,
        defaultSelectedIndex: React.PropTypes.number
    }

    static defaultProps = {
        onEscape: () => {
        }
    }

    constructor(props) {
        super(props);

        this.state = {
            selectedIndex: this.props.defaultSelectedIndex ? this.props.defaultSelectedIndex : 0
        }

        // bind methods
        this._itemComponentForItem = this._itemComponentForItem.bind(this);
    }

    getSelectedItem() {
        return this.props.items[this.state.selectedIndex];
    }

    setSelectedItem(item) {
        this.setState({selectedIndex: this.props.items.indexOf(item)})
    }

    componentWillReceiveProps(newProps) {

        if (this.state.selectedIndex >= 0) {
            selection = this.props.items[this.state.selectedIndex]
            newSelectionIndex = 0
        } else {
            newSelectionIndex = newProps.defaultSelectedIndex ? newProps.defaultSelectedIndex : -1
        }

        if (selection) {
            selectionKey = this.props.itemKey(selection)
            newSelection = _.find(newProps.items, (item) => this.props.itemKey(item) == selectionKey)
            if (newSelection) newSelectionIndex = newProps.items.indexOf(newSelection)
        }

        this.setState({selectedIndex: newSelectionIndex})
    }

    componentDidUpdate() {
        item = ReactDOM.findDOMNode(this).querySelector(".selected")
        container = ReactDOM.findDOMNode(this).querySelector(".content-container")
        /*adjustment = DOMUtils.scrollAdjustmentToMakeNodeVisibleInContainer(item, container)
        if (adjustment != 0)
            container.scrollTop += adjustment*/
    }

    render() {
        hc = this.props.headerComponents ? this.props.headerComponents : []
        if (hc.length == 0) hc = <span></span>
        fc = this.props.footerComponents ? this.props.footerComponents : []
        if (fc.length == 0) fc = <span></span>

        return (
            <div onKeyDown={this._onKeyDown}
                 className={"native-key-bindings menu " + this.props.className}
                 tabIndex="-1">
                <div className="header-container">
                    {hc}
                </div>
                {this._contentContainer()}
                <div className="footer-container">
                    {fc}
                </div>
            </div>
        )
    }

    _onKeyDown(event) {
        if (this.props.items.length == 0) return;
        event.stopPropagation()
        if (["Enter", "Return"].indexOf(event.key) > -1)
            this._onEnter()
        if (event.key == "Escape")
            this._onEscape()
        else if (event.key == "ArrowUp" || (event.key == "Tab" && event.shiftKey)) {
            this._onShiftSelectedIndex(-1)
            event.preventDefault()
        }
        else if (event.key == "ArrowDown" || event.key == "Tab") {
            this._onShiftSelectedIndex(1)
            event.preventDefault()
        }

        return
    }

    _contentContainer() {
        items = this.props.items.map(this._itemComponentForItem) || []
        contentClass = classNames({
            'content-container': true,
            'empty': items.length == 0
        })

        return (
            <div className={contentClass}>
                {items}
            </div>
        )
    }

    _itemComponentForItem(item, i) {
        content = this.props.itemContent(item)

        if (React.isValidElement(content) && content.type == MenuItem)
            return content

        onMouseDown = (event) => {
            event.preventDefault()
            if (this.props.onSelect) this.props.onSelect(item)
        }

        return (
            <MenuItem
                onMouseDown={onMouseDown}
                key={this.props.itemKey(item)}
                checked={this.props.itemChecked && this.props.itemChecked(item)}
                content={content}
                selected={this.state.selectedIndex == i}
            />
        )
    }

    _onShiftSelectedIndex(delta) {
        if (this.props.items.length == 0) return;

        index = this.state.selectedIndex + delta

        isDivider = true
        while (isDivider) {
            item = this.props.items[index]
            if (!item) break;
            if (this.props.itemContent(item).props && this.props.itemContent(item).props.divider)
                if (delta > 0) index += 1
                else if (delta < 0) index -= 1
                else isDivider = false
        }

        index = Math.max(0, Math.min(this.props.items.length - 1, index))


        this.setState({selectedIndex: index})
    }

    _onEnter() {
        item = this.props.items[this.state.selectedIndex]
        if (item) this.props.onSelect(item)
    }

    _onEscape() {
        this.props.onEscape()
    }

}

Menu.Item = MenuItem;
Menu.NameEmailItem = MenuNameEmailItem;

module.exports = Menu