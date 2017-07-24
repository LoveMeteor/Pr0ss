import React from 'react';
import Actions from '../../../api/nylas/actions';
import NylasUtils from '../../../api/nylas/nylas-utils';

export default class ThreadTrashButton extends React.Component {
    static displayName = 'ThreadTrashButton';

    static propTypes = {
        thread: React.PropTypes.object
    }

    constructor(props) {
        super(props)

        this._onRemove = this._onRemove.bind(this)
    }
    render() {
        canTrashThreads = NylasUtils.canTrashThreads()
        if (!canArchiveThreads) return <span />

        return (
            <button className="btn1 btn-toolbar"
                    style={{order: -106}}
                    title="Move to Trash"
                    onClick={this._onRemove}
                    disabled={!this.props.thread}
            >
                <img src="/icons/inbox/toolbar-trash.png" width="50%"/>
            </button>
        )
    }

    _onRemove = (e) => {
        /*return unless DOMUtils.nodeIsVisible(e.currentTarget)
         tasks = TaskFactory.tasksForMovingToTrash
         threads: [@props.thread]
         Actions.queueTasks(tasks)
         Actions.popSheet()
         e.stopPropagation()*/
    }

}
