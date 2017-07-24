import React from 'react';
import Actions from '../../../api/nylas/actions';
import NylasUtils from '../../../api/nylas/nylas-utils';
import ChangeUnreadTask from '../../../api/nylas/tasks/change-unread-task'

export default class ThreadToggleUnreadButton extends React.Component {
    static displayName = 'ThreadToggleUnreadButton';

    static propTypes = {
        thread: React.PropTypes.object
    }

    constructor(props) {
        super(props)

        this._onClick = this._onClick.bind(this)
    }

    render() {
        fragment = this.props.thread && this.props.thread.unread ? 'read' : 'unread'
        return (
            <button className="btn1 btn-toolbar"
                    style={{order: -105}}
                    title={`Mark as ${fragment}`}
                    onClick={this._onClick}
                    disabled={!this.props.thread}>
                <img src={`/icons/inbox/toolbar-markas${fragment}.png`} width="50%"/>
            </button>
        )
    }

    _onClick = (e) => {
         task = new ChangeUnreadTask({
             thread: this.props.thread,
             unread: !this.props.thread.unread
         })
         Actions.queueTask(task)

         e.stopPropagation()
    }

}
