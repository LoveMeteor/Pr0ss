import React from 'react'
import ReactDOM from 'react-dom'
import classnames from 'classnames'

export default class ButtonDropdown extends React.Component {
    static propTypes = {
        primaryItem: React.PropTypes.element,
        primaryClick: React.PropTypes.func,
        bordered: React.PropTypes.bool,
        menu: React.PropTypes.element,
        style: React.PropTypes.object,
        closeOnMenuClick: React.PropTypes.bool
    }

    static defaultProps = {
        style: {}
    }

    constructor(props) {
        super(props);

        this.state = {
            open: false
        }

        this.bindMethods();
    }


    bindMethods() {
        this.toggleDropdown = this.toggleDropdown.bind(this);
        this._onBlur = this._onBlur.bind(this);
        this._onMenuClick = this._onMenuClick.bind(this);
    }

    render() {
        classes = classnames({
            'button-dropdown': true,
            'open open-up': this.state.open == 'up',
            'open open-down': this.state.open == 'down',
            'bordered': this.props.bordered
        })
        if (this.props.primaryClick)
            return (
                <div ref="button" onBlur={this._onBlur} tabIndex={-1}
                     className={`${classes} ${this.props.className ? this.props.className : ''}`}
                     style={this.props.style}>
                    <div className="primary-item"
                         title={this.props.primaryTitle ? this.props.primaryTitle : ""}
                         onClick={this.props.primaryClick}>
                        {this.props.primaryItem}
                    </div>
                    <div className="secondary-picker" onClick={this.toggleDropdown}>
                        <img src="/icons/inbox/icon-thread-disclosure.png" width="8px"/>
                    </div>
                    <div ref="secondaryItems" className="secondary-items" onMouseDown={this._onMenuClick}>
                        {this.props.menu}
                    </div>
                </div>
            )
        else
            return (
                <div ref="button" onBlur={this._onBlur} tabIndex={-1}
                     className={`${classes} ${this.props.className ? this.props.className : ''}`}
                     style={this.props.style}>
                    <div className="only-item"
                         title={this.props.primaryTitle ? this.props.primaryTitle : ""}
                         onClick={this.toggleDropdown}>
                        {this.props.primaryItem}
                        <img src="/icons/inbox/icon-thread-disclosure.png" style={{marginLeft: 12}}/>
                    </div>
                    <div ref="secondaryItems" className="secondary-items left" onMouseDown={this._onMenuClick}>
                        {this.props.menu}
                    </div>
                </div>
            )
    }

    toggleDropdown() {
        if (this.state.open)
            this.setState({open: false})
        else {
            buttonBottom = ReactDOM.findDOMNode(this).getBoundingClientRect().bottom
            openHeight = ReactDOM.findDOMNode(this.refs.secondaryItems).getBoundingClientRect().height
            if (buttonBottom + openHeight > window.innerHeight)
                this.setState({open: 'up'})
            else
                this.setState({open: 'down'})
        }
    }

    _onMenuClick(event) {
        if (this.props.closeOnMenuClick)
            this.setState({open: false})
    }

    _onBlur(event) {
        target = event.nativeEvent.relatedTarget
        if (target && ReactDOM.findDOMNode(this.refs.button).contains(target))
            return
        this.setState({open: false})
    }
}