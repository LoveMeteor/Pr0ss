import React, {PropTypes} from 'react'
import {Panel, Button, Radio} from 'react-bootstrap'

export default class ParticipantList extends React.Component {
    static propTypes = {
        participants: PropTypes.array.isRequired,
        addableParticipant: PropTypes.bool,
        onChangeParticipants: PropTypes.func
    }

    constructor(props) {
        super(props)

        this.state = {
            participants: props.participants || []
        }
    }

    componentWillReceiveProps(newProps) {
        //if(this.props.participants !== newProps.participants) {
            this.setState({participants:newProps.participants})
        //}
    }
    setAsMain = (participant) => {
        const {participants} = this.state
        participants.forEach(p => {
            if(p._id === participant._id) p.isMain = true
            else p.isMain = false
        })
        this.setState({participants})

        if(this.props.onChangeParticipants) this.props.onChangeParticipants(participants.map(p => ({peopleId:p._id, isMain:p.isMain})))
    }
    render() {
        const style = this.props.style
        const header = (
            <div style={{display: 'flex'}}>
                <div style={{flex: 1}}>
                    Participants
                </div>
                <div>
                    <Button bsStyle="danger" bsSize="xsmall"
                            onClick={this.props.onAddParticipant}>
                        <i className="fa fa-plus"/>
                    </Button>
                </div>
            </div>
        )
        return (
            <div className="participant-list" style={style}>
                <Panel header={header}>
                    {
                        this.state.participants.map((p, i) => (
                            <div key={i} className="participant-item">
                                <div style={{flex:1}}>
                                    <div>{p.name}</div>
                                    <div>{p.defaultEmail()}</div>
                                    <div>{`${p.designation() && p.designation().name} / ${p.role}`}</div>
                                </div>
                                <div style={{paddingLeft:10, margin:'auto'}}>
                                    <Radio checked={p.isMain} onChange={(e) => this.setAsMain(p)}/>
                                </div>
                            </div>
                        ))
                    }
                </Panel>
            </div>
        )
    }
}