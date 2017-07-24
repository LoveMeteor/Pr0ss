import _ from 'underscore'
import React from 'react'
import Menu from '../../utils/Menu'
import ButtonDropdown from '../../utils/ButtonDropdown'
import Actions from '../../../../api/nylas/actions'


const CONFIG_KEY = "core.sending.defaultSendType";

export default class SendActionButton extends React.Component {
    static displayName = "SendActionButton";

    static propTypes = {
        clientId: React.PropTypes.string,
        style: React.PropTypes.object,
        isValidDraft: React.PropTypes.func,
        disabled: React.PropTypes.func
    };

    static defaultProps = {
        style: {},
    };

    constructor(props) {
        super(props)
        this.state = {
            actionConfigs: this._actionConfigs(this.props),
        };
    }

    componentDidMount() {

    }

    componentWillReceiveProps(newProps) {
        this.setState({actionConfigs: this._actionConfigs(newProps)});
    }

    componentWillUnmount() {

    }

    primaryClick = () => {
        this._onPrimaryClick();
    }

    _defaultActionConfig() {
        return ({
            title: "Send",
            iconUrl: null,
            onSend: (clientId) => Actions.sendDraft(clientId),
            configKey: "send",
        });
    }

    _actionConfigs(props) {
        const actionConfigs = [this._defaultActionConfig()]

        actionConfigs.push({
            title: "Send and archive",
            iconUrl: null,
            onSend: (clientId) => {
                Actions.sendDraft(clientId)

                // Queue task for archiving
                //tasks = TaskFactory.tasksForArchiving({threads:threads})
                //Actions.queueTasks(tasks)
            },
            configKey: "sendAndArchive"
        })
        actionConfigs.push({
            title: "Send later",
            iconUrl: null,
            onSend: ({draft}) => {
                // TO DO: implement send later logic here
            },
            configKey: "sendLater"
        })
        return actionConfigs;
    }

    _onPrimaryClick = () => {
        const {preferred} = this._orderedActionConfigs();
        this._onSendWithAction(preferred);
    }

    _onSendWithAction = ({onSend}) => {
        if (this.props.isValidDraft()) {
            try {
                onSend(this.props.clientId);
            } catch (err) {
                console.error(err)
            }
        }
    }

    _orderedActionConfigs() {
        const configKeys = _.pluck(this.state.actionConfigs, "configKey");
        let preferredKey = null // Should set from user preferred send type
        if (!preferredKey || !configKeys.includes(preferredKey)) {
            preferredKey = this._defaultActionConfig().configKey;
        }

        const preferred = _.findWhere(this.state.actionConfigs, {configKey: preferredKey});
        const rest = _.without(this.state.actionConfigs, preferred);

        return {preferred, rest};
    }

    _contentForAction = ({iconUrl, title}) => {
        return (
            <span>
                <img src="/icons/inbox/icon-composer-send.png" width="16px"/>
                <span className="text">{title}</span>
            </span>
        );
    }

    _renderSingleButton() {
        if (this.props.disabled())
            return (
                <button
                    tabIndex={-1}
                    className={"btn1 btn-toolbar btn-normal btn-emphasis btn-text btn-send"}
                    style={{order: -100}}
                    onClick={this._onPrimaryClick}
                    disabled>
                    {this._contentForAction(this.state.actionConfigs[0])}
                </button>
            );
        else
            return (
                <button
                    tabIndex={-1}
                    className={"btn1 btn-toolbar btn-normal btn-emphasis btn-text btn-send"}
                    style={{order: -100}}
                    onClick={this._onPrimaryClick}>
                    {this._contentForAction(this.state.actionConfigs[0])}
                </button>
            );
    }

    _renderButtonDropdown() {
        const {preferred, rest} = this._orderedActionConfigs()

        const menu = (
            <Menu
                items={rest}
                itemKey={ (actionConfig) => actionConfig.configKey }
                itemContent={this._contentForAction}
                onSelect={this._onSendWithAction}
            />
        );

        if (this.props.disabled())
        {
            return (
                <ButtonDropdown
                    className={"btn-send btn-emphasis btn-text"}
                    style={{order: -100}}
                    primaryItem={this._contentForAction(preferred)}
                    primaryTitle={preferred.title}
                    primaryClick={this._onPrimaryClick}
                    closeOnMenuClick
                    menu={menu}
                    disabled
                />
            );
        }
        else
        {
            return (
                <ButtonDropdown
                    className={"btn-send btn-emphasis btn-text"}
                    style={{order: -100}}
                    primaryItem={this._contentForAction(preferred)}
                    primaryTitle={preferred.title}
                    primaryClick={this._onPrimaryClick}
                    closeOnMenuClick
                    menu={menu}
                />
            );
        }

    }

    render() {
        if (this.state.actionConfigs.length === 1) {
            return this._renderSingleButton();
        }
        return this._renderButtonDropdown();
    }

}
