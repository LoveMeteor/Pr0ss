import _ from 'underscore'
import React from 'react'
import TrackerReact from 'meteor/ultimatejs:tracker-react'
import NylasUtils from '/imports/api/nylas/nylas-utils'
import MessageItemContainer from '../../inbox/MessageItemContainer'
import ConversationStore from '/imports/api/nylas/conversation-store'
import Actions from '/imports/api/nylas/actions'
import Radium from 'radium'

@Radium
class ConversationList extends TrackerReact(React.Component) {

    static propTypes = {
        salesRecordId: React.PropTypes.string,
        conversationId: React.PropTypes.string
    }
    constructor(props) {
        super(props)



        this.MINIFY_THRESHOLD = 3

        const {salesRecordId, conversationId} = this.props
        this.store = new ConversationStore({salesRecordId, conversationId})

        this.state = this._getStateFromStore()
        this.state.minified = true
    }

    _getStateFromStore() {
        return {
            messagesExpandedState: this.store.messagesExpanded()
        }
    }
    componentDidMount() {
        this.unsubscribes = []
        this.unsubscribes.push(this.store.listen(this.onStoreChanged))
    }

    componentWillUnmount() {
        this.unsubscribes.forEach((unsubscribe) => {
            unsubscribe()
        })
    }

    onStoreChanged = () => {
        const newState = this._getStateFromStore()

        this.setState(newState)
    }

    render() {
        const style = Object.assign({marginTop:10}, this.props.style)
        return (
            <div className="list-message" style={style}>
                {this.renderMessages()}
            </div>
        )
    }

    renderMessages() {
        const elements = []

        this.messages = this.store.messages(() => {
            setTimeout(() => {
                this.setState(this._getStateFromStore())
            }, 100)
        })
        let messages = this.messages
        const lastMessage = _.last(messages)
        const hasReplyArea = lastMessage && !lastMessage.draft
        messages = this._messagesWithMinification(messages)
        messages.forEach((message, idx) => {

            if (message.type == 'minifiedBundle') {
                elements.push(this._renderMinifiedBundle(message))
                return
            }

            const collapsed = !this.state.messagesExpandedState[message.id]
            const isLastMsg = (messages.length - 1 == idx)
            const isBeforeReplyArea = isLastMsg && hasReplyArea

            elements.push(  // Should be replaced message.id to message.clientId in future
                <MessageItemContainer key={message.id}
                                      ref={`message-container-${message.id}`}
                                      message={message}
                                      collapsed={collapsed}
                                      isLastMsg={isLastMsg}
                                      isBeforeReplyArea={isBeforeReplyArea}
                                      scrollTo={this._scrollTo}
                                      salesRecordId={this.props.salesRecordId}
                                      conversationId={this.props.conversationId}
                />
            )
        })

        if (hasReplyArea)
            elements.push(this._renderReplyArea())

        return elements
    }

    _messagesWithMinification(messages=[]) {
        if(!this.state.minified) return messages

        messages = _.clone(messages)
        const minifyRanges = []
        let consecutiveCollapsed = 0

        messages.forEach((message, idx) => {
            if(idx == 0)return

            const expandState = this.state.messagesExpandedState[message.id]

            if(!expandState)
                consecutiveCollapsed += 1
            else
            {
                let minifyOffset
                if(expandState == 'default')
                    minifyOffset = 1
                else //if expandState is "explicit"
                    minifyOffset = 0

                if(consecutiveCollapsed >= this.MINIFY_THRESHOLD + minifyOffset)
                    minifyRanges.push({
                        start: idx - consecutiveCollapsed,
                        length: (consecutiveCollapsed - minifyOffset)
                    })
                consecutiveCollapsed = 0
            }
        })

        let indexOffset = 0
        for(const range of minifyRanges) {
            const start = range.start - indexOffset
            const minified = {
                type: 'minifiedBundle',
                messages: messages.slice(start, start + range.length)
            }
            messages.splice(start, range.length, minified)

            indexOffset += (range.length - 1)
        }

        return messages
    }

    _renderMinifiedBundle(bundle) {
        const BUNDLE_HEIGHT = 36
        const lines = bundle.messages.slice(0, 10)
        const h = Math.round(BUNDLE_HEIGHT / lines.length)

        return (
            <div className="minified-bundle"
                 onClick={() => this.setState({minified: false})}
                 key={NylasUtils.generateTempId()}>
                <div className="num-messages">{bundle.messages.length} older messages</div>
                <div className="msg-lines" style={{height: h * lines.length}}>
                    {
                        lines.map((msg, i) =>
                            <div key={msg.id} style={{height: h * 2, top: -h * i}} className="msg-line"></div>)
                    }
                </div>
            </div>
        )
    }

    _renderReplyArea() {
        const icon = `/icons/inbox/${this._replyType()}-footer.png`
        return (
            <div className="footer-reply-area-wrap" onClick={this._onClickReplyArea} key='reply-area'>
                <div className="footer-reply-area">
                    <img src={icon} width="19px"/>
                    <span className="reply-text">Write a reply…</span>
                </div>
            </div>
        )
    }


    _replyType() {
        const defaultReplyType = 'reply-all'
        const lastMessage = _.last(_.filter(this.state.messages?this.state.messages:[], (m) => !m.draft))
        if (!lastMessage) return 'reply'

        if (NylasUtils.canReplyAll(lastMessage)) {
            if (defaultReplyType == 'reply-all')
                return 'reply-all'
            else
                return 'reply'
        } else {
            return 'reply'
        }
    }

    _lastMessage() {
        const messages = this.messages || []
        return _.last(_.filter(messages, m => !m.draft))
    }
    _onClickReplyArea = () => {
        const {salesRecordId, conversationId} = this.props
        Actions.composeReply({
            message: this._lastMessage(),
            type: this._replyType(),
            behavior: 'prefer-existing-if-pristine',
            modal: true,
            salesRecordId,
            conversationId
        })

    }

}

export default ConversationList
