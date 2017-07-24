import React from 'react'
import ReactDOM from 'react-dom'
import url from 'url'
import _ from 'underscore'

export default class EventedIFrame extends React.Component {
    static propTypes = {
        searchable: React.PropTypes.bool,
        onResize: React.PropTypes.func
    }

    componentDidMount() {
        if (this.props.searchable) {

        }
        this._subscribeToIFrameEvents();
    }

    componentWillUnmount() {
        this._unsubscribeFromIFrameEvents();

        if (this.props.searchable) {

        }
    }

    componentDidUpdate() {
        if (this.props.searchable) {

        }
    }

    /*shouldComponentUpdate(nextProps, nextState) {
     return !Utils.isEqualReact(nextProps, this.props) || !Utils.isEqualReact(nextState, this.state);
     }*/

    render() {
        return <iframe seamless="seamless" {...this.props} />
    }

    didReplaceDocument() {
        this._unsubscribeFromIFrameEvents();
        this._subscribeToIFrameEvents();
    }

    setHeightQuietly(height) {
        this._ignoreNextResize = true;
        ReactDOM.findDOMNode(this).height = `${height}px`;
    }

    _onSearchableStoreChange() {

    }

    _unsubscribeFromIFrameEvents() {
        const node = ReactDOM.findDOMNode(this);
        const doc = node.contentDocument;

        if (!doc) return;

        doc.removeEventListener('click', this._onIFrameClick);
        //doc.removeEventListener('keydown', this._onIFrameKeydown);
        doc.removeEventListener('mousedown', this._onIFrameMouseEvent);
        doc.removeEventListener('mousemove', this._onIFrameMouseEvent);
        doc.removeEventListener('mouseup', this._onIFrameMouseEvent);
        //doc.removeEventListener('contextmenu', this._onIFrameContextualMenu);

        if (node.contentWindow) {
            node.contentWindow.removeEventListener('focus', this._onIFrameFocus);
            node.contentWindow.removeEventListener('blur', this._onIFrameBlur);
            node.contentWindow.removeEventListener('resize', this._onIFrameResize);
        }
    }

    _subscribeToIFrameEvents() {
        const node = ReactDOM.findDOMNode(this)
        const doc = node.contentDocument

        _.defer(() => {
            doc.addEventListener("click", this._onIFrameClick)
            //doc.addEventListener("keydown", this._onIFrameKeydown)
            doc.addEventListener("mousedown", this._onIFrameMouseEvent)
            doc.addEventListener("mousemove", this._onIFrameMouseEvent)
            doc.addEventListener("mouseup", this._onIFrameMouseEvent)
            //doc.addEventListener("contextmenu", this._onIFrameContextualMenu)
            if (node.contentWindow) {
                node.contentWindow.addEventListener("focus", this._onIFrameFocus)
                node.contentWindow.addEventListener("blur", this._onIFrameBlur)
                if (this.props.onResize) node.contentWindow.addEventListener('resize', this._onIFrameResize)
            }
        });
    }

    _getContainingTarget = (event, options) => {
        let target = event.target;

        while (target && target != document && target != window) {
            if (target.getAttribute(options.with)) return target;

            target = target.parentElement;
        }
        return null;
    }

    _onIFrameBlur = (event) => {
        const node = ReactDOM.findDOMNode(this);
        node.contentWindow.getSelection().empty();
    }

    _onIFrameFocus = (event) => {
        window.getSelection().empty();
    }

    _onIFrameResize = (event) => {
        if (this._ignoreNextResize) {
            this._ignoreNextResize = false;
            return;
        }
        if (this.props.onResize) this.props.onResize(event);
    }

    _onIFrameClick = (e) => {
        e.stopPropagation()
        const target = this._getContainingTarget(e, {with: 'href'});

        if (target) {
            const rawHref = target.getAttribute('href')

            if (this._isBlacklistedHref(rawHref)) {
                e.preventDefault()
                return
            }

            if (!url.parse(rawHref).protocol) {
                if ((new RegExp(/^\/\//)).test(rawHref))
                    target.setAttribute('href', `https:${rawHref}`)
                else
                    target.setAttribute('href', `http://${rawHref}`)
            }

            e.preventDefault()
            window.open(target.getAttribute('href'))
        }
    }

    _isBlacklistedHref(href) {
        return (new RegExp(/^file:/i)).test(href)
    }

    _onIFrameMouseEvent = (event) => {
        const node = ReactDOM.findDOMNode(this)
        const nodeRect = node.getBoundingClientRect()

        const eventAttrs = {}

        for (let key of Object.keys(event)) {
            if (key in ['webkitMovementX', 'webkitMovementY']) continue;
            eventAttrs[key] = event[key];
        }

        node.dispatchEvent(new MouseEvent(event.type, _.extend({}, eventAttrs, {
            clientX: event.clientX + nodeRect.left,
            clientY: event.clientY + nodeRect.top,
            pageX: event.pageX + nodeRect.left,
            pageY: event.pageY + nodeRect.top,
        })))
    }

    _onIFrameKeydown = (event) => {
        if (event.metaKey || event.altKey || event.ctrlKey) return;
        ReactDOM.findDOMNode(this).dispatchEvent(new KeyboardEvent(event.type, event))
    }

    _onIFrameContextualMenu = (event) => {
        event.preventDefault();
    }
}