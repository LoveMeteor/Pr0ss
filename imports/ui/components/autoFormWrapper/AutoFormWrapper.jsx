import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import { Template } from 'meteor/templating';
import { Blaze } from 'meteor/blaze';

export default class AutoFormWrapper extends Component {
    constructor(props) {
        super(props);
        this.renderWithData = (view, props, container) => {
            const { schema, id, type  } = props;
            if (view) Blaze.remove(view);
            return Blaze.renderWithData(Template.quickForm, {
                schema,
                id,
                type,
            }, container);
        };
    }

    componentWillUnmount() {
        Blaze.remove(this.view);
        Template.quickForm._callbacks.rendered = [];
    }

    componentDidUpdate() {
        this.view = this.renderWithData(this.view, this.props, this.refs.container);
    }

    componentDidMount() {
        const _this = this;
        Template.quickForm.onRendered(function() {
            _this.props.onRendered && _this.props.onRendered.bind(this)();
        });
        this.view = this.renderWithData(this.view, this.props, this.refs.container);
    }

    render() {
        return <div ref="container"/>;
    }
}

