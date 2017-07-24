import React from 'react';
import Actions from '../../../api/nylas/actions';
import NylasUtils from '../../../api/nylas/nylas-utils';

export default class ThreadStarButton extends React.Component {
    static displayName = 'ThreadStarButton';

    static propTypes = {
        thread: React.PropTypes.object
    }

    constructor(props) {
        super(props)

        this._onStarToggle = this._onStarToggle.bind(this)
    }
    render() {
        selected = this.props.thread && this.props.thread.selected

        return (
            <button className="btn1 btn-toolbar"
                    style={{order: -104}}
                    title={selected?'Remove star':'Add star'}
                    onClick={this._onStarToggle}
                    disabled={!this.props.thread}>
                <img src={`/icons/inbox/toolbar-star${selected?'-selected':''}.png`} width="50%"/>
            </button>
        )
    }

    _onStarToggle = (e) => {
        /*task = new ChangeStarredTask({
         thread: @props.thread
         starred: !@props.thread.starred
         })
         Actions.queueTask(task)
         e.stopPropagation()*/
    }

}
