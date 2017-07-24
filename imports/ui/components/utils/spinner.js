import React from 'react'
import _ from 'underscore'
import classNames from 'classnames'

export default class Spinner extends React.Component {
    constructor (props) {
        super(props);
        this.timer = null;
        this.state = {
            hidden: true,
            paused: true
        }
    }
    componentDidMount () {
        if (this.props.visible && this.state.hidden)
            this.showAfterDelay()
    }

    componentWillUnmount () {
        if(this.timer) clearTimeout(this.timer)
    }

    componentWillReceiveProps (nextProps) {
        let hidden = !nextProps.visible;

        if(!this.state.hidden && hidden) {
            this.setState({hidden: true})
            this.pauseAfterDelay()
        } else if (this.state.hidden && !hidden) {
            this.showAfterDelay()
        }
    }


    pauseAfterDelay () {
        if(this.timer) clearTimeout(this.timer)

        this.timer = setTimeout(()=> {
            if (this.props.visible) return;
            this.setState({paused: true});
        },250);
    }

    showAfterDelay () {
        if(this.timer) clearTimeout(this.timer)

        this.timer = setTimeout(()=> {
            if(!this.props.visible) return;
            this.setState({paused: false, hidden: false});
        }, 300);
    }

    render () {
        if(this.props.withCover) {
            return this._renderDotsWithCover();
        } else {
            return this._renderSpinnerDots();
        }
    }


    _renderDotsWithCover () {
        let coverClasses = classNames({
            "spinner-cover": true,
            "hidden": this.state.hidden
        })

        let style = Object.assign({}, (this.props.style ? this.props.style : {}), {
            'position': 'absolute',
            'display': this.state.hidden ? "none" : "block",
            'top': '0',
            'left': '0',
            'width': '100%',
            'height': '100%',
            'background': 'rgba(255,255,255,0.9)',
            'zIndex': 1000
        });

        return (
            <div className={coverClasses} style={style}>
                {this._renderSpinnerDots()}
            </div>
        )
    }

    _renderSpinnerDots () {

        let spinnerClass = classNames({
            'spinner': true,
            'hidden': this.state.hidden,
            'paused': this.state.paused
        })

        let style = _.extend({}, (this.props.style ? this.props.style : {}), {
            'position': 'absolute',
            'left': '45%',
            'top': '50%',
            'zIndex': 1001,
            'transform': 'translate(-50%,-50%)'
        });

        let otherProps = _.omit(this.props, Object.keys(this.constructor.propTypes));

        return (
            <div className={spinnerClass} {...otherProps} style={style}>
                <div className="bounce1"></div>
                <div className="bounce2"></div>
                <div className="bounce3"></div>
                <div className="bounce4"></div>
            </div>
        );
    }
}

Spinner.propTypes = {
    visible: React.PropTypes.bool,
    withCover: React.PropTypes.bool,
    style: React.PropTypes.object
}