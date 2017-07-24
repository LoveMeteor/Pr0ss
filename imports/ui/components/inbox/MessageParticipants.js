import _ from 'underscore';
import React from 'react';
import classnames from 'classnames';
import NylasUtils from '../../../api/nylas/nylas-utils';

const MAX_COLLAPSED = 5;

class MessageParticipants extends React.Component {

    constructor(props) {
        super(props);

        this.selectText = this.selectText.bind(this);
    }


    allToParticipants() {
        return _.union(this.props.to, this.props.cc, this.props.bcc);
    }

    shortNames(participants = [], max = MAX_COLLAPSED) {
        let names = NylasUtils.getParticipantsNamesArray(participants, false);
        if (names.length > max) {
            extra = names.length - max;
            names = names.slice(0, max);
            names.push(`and ${extra} more`);
        }
        return names.join(", ");
    }

    selectText(e) {
        textNode = e.currentTarget.childNodes[0]

        range = document.createRange()
        range.setStart(textNode, 0)
        range.setEnd(textNode, textNode.length)
        selection = document.getSelection()
        selection.removeAllRanges()
        selection.addRange(range)
    }


    render() {
        classSet = classnames({
            "participants": true,
            "message-participants": true,
            "collapsed": !this.props.isDetailed,
            "from-participants": this.props.from.length > 0,
            "to-participants": this.allToParticipants().length > 0
        })

        return (
            <div className={classSet} onClick={this.props.onClick}>
                {this.props.isDetailed ? this.renderExpanded() : this.renderCollapsed()}
            </div>
        )
    }

    renderExpanded() {
        let expanded = [];

        if (this.props.from.length > 0) {
            expanded.push(this.renderExpandedField('from', this.props.from, {includeLabel: false}));
        }
        if (this.props.to.length > 0) {
            expanded.push(this.renderExpandedField('to', this.props.to));
        }
        if (this.props.cc.length > 0) {
            expanded.push(this.renderExpandedField('cc', this.props.cc));
        }
        if (this.props.bcc.length > 0) {
            expanded.push(this.renderExpandedField('bcc', this.props.bcc));
        }

        return (
            <div className="expanded-participants">
                {expanded}
            </div>
        )
    }

    renderFullParticipants(participants = []) {
        _.map(participants, (p, i) => {

            if (participants.length == 1) comma = "";
            else if (i == participants.length - 1) comma = "";
            else comma = ","

            if (p.name && p.name.length > 0 && p.name != p.email)
                return (
                    <div key={`${p.email}-${i}`} className="participant selectable">
                        <div className="participant-primary" onClick={this.selectText}>
                            {p.name}
                        </div>
                        <div className="participant-secondary">
                            {"<"}<span onClick={this.selectText}>{p.email}</span>{`>${comma}`}
                        </div>
                    </div>
                )
            else
                return (
                    <div key={`${p.email}-${i}`} className="participant selectable">
                        <div className="participant-primary">
                            <span onClick={this.selectText}>{p.email}</span>{comma}
                        </div>
                    </div>
                )
        })
    }

    renderExpandedField(name, field, {includeLabel} = {}) {
        includeLabel = includeLabel || true;

        return (
            <div className="participant-type" key={`participant-type-${name}`}>
                {includeLabel ? <div className={`participant-label ${name}-label`}>{name}:&nbsp;</div> : undefined}
                <div className={`participant-name ${name}-contact`}>
                    {this.renderFullContacts(field)}
                </div>
            </div>
        )
    }

    renderFullContacts(contacts = []) {
        return _.map(contacts, (c, i) => {
            if (contacts.length == 1) comma = ""
            else if (i == contacts.length - 1) comma = ""
            else comma = ","

            if (c.name && c.name.length && c.name != c.email) {
                return (
                    <div key={`${c.email}-${i}`} className="participant selectable">
                        <div className="participant-primary" onClick={this.selectText}>
                            {c.name}
                        </div>
                        <div className="participant-secondary">
                            {"<"}<span onClick={this.selectText}>{c.email}</span>{`>${comma}`}
                        </div>
                    </div>
                )
            } else {
                return (
                    <div key={`${c.email}-${i}`} className="participant selectable">
                        <div className="participant-primary">
                            <span onClick={this.selectText}>{c.email}</span>{comma}
                        </div>
                    </div>
                )
            }
        });
    }

    renderCollapsed() {
        let childSpans = [];
        let toParticipants = this.allToParticipants();

        if (this.props.from.length > 0) {
            childSpans.push(<span className="participant-name from-contact"
                                  key="from">{this.shortNames(this.props.from)}</span>)
        }

        if (toParticipants.length > 0) {
            childSpans.push([
                <span className="participant-label to-label" key="to-label">To:&nbsp;</span>,
                <span className="participant-name to-contact" key="to-value">{this.shortNames(toParticipants)}</span>
            ])
        }

        return (
            <span className="collapsed-participants">
                {childSpans}
            </span>
        )
    }
}

MessageParticipants.propTypes = {
    to: React.PropTypes.array,
    cc: React.PropTypes.array,
    bcc: React.PropTypes.array,
    from: React.PropTypes.array,
    onClick: React.PropTypes.func,
    isDetailed: React.PropTypes.bool
}

MessageParticipants.defaultProps = {
    to: [],
    cc: [],
    bcc: [],
    from: []
}

export default MessageParticipants;
