import React from 'react'
import NylasUtils from '../../../api/nylas/nylas-utils'

class ItemThread extends React.Component{
    static propTypes = {
        thread: React.PropTypes.object.isRequired,
        onClick: React.PropTypes.func,
        selected: React.PropTypes.bool
    }

    constructor(props) {
        super(props)
    }

    render() {
        const {participants, subject, snippet, unread, last_message_received_timestamp, message_ids, draft_ids, has_attachments} = this.props.thread
        return (
            <div className={`item${this.props.selected ? ' focused' :''}`} onClick={(evt) => {this.props.onClick(evt)}}>
                <div className="thread-info-column">
                    <div className="participants-wrapper">
                        <div className="participants">
                            <span className={unread&&'unread'}>{NylasUtils.getParticipantsNamesString(participants)}</span>
                        </div>
                        {message_ids && message_ids.length>1 && <div>&nbsp;({message_ids.length})</div>}
                        {draft_ids && draft_ids.length>0 && <div className="thread-icon thread-icon-pencil"></div>}
                        {has_attachments && <div className="thread-icon thread-icon-attachment"></div>}
                        <span style={{flexGrow:1, flexShrink:1, flexBasis:'0%'}}></span>
                        <span className="timestamp">{NylasUtils.shortTimeString(last_message_received_timestamp)}</span>
                    </div>
                    <div className="subject">
                        <span className={unread&&'unread'}>{subject}</span>
                    </div>
                    <div className="snippet-and-labels">
                        <div className="snippet">
                            {snippet}
                        </div>
                        <div style={{flexGrow:1, flexShrink:1, flexBasis:'0%'}}>

                        </div>
                    </div>
                </div>
            </div>
        )
    }
}

export default ItemThread
