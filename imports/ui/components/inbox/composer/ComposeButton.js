import React from 'react';
import Actions from '../../../../api/nylas/actions';

export default class ComposeButton extends React.Component {
    static displayName = 'ComposeButton';

    static propTypes = {
        salesRecordId: React.PropTypes.string,
        conversationId: React.PropTypes.string
    }

    constructor(props) {
        super(props)
    }

    _onNewCompose = () => {
        const {salesRecordId, conversationId} = this.props
        Actions.composeNew({salesRecordId, conversationId})
    }

    render() {
        return (
            <button
                className="btn1 btn-toolbar item-compose"
                title="Compose new message"
                onClick={this._onNewCompose}>
                <img src="/icons/inbox/toolbar-compose.png" width="50%"/>
            </button>


        );
    }
}
