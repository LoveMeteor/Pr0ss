import React, {Component, PropTypes} from 'react'
import Select from 'react-select'
import People from '/imports/api/models/people/people'
import {createContainer} from 'meteor/react-meteor-data'

export default class SelectPeople extends Component {
    static propTypes = {
        people: PropTypes.array,
        onSelectPeople: PropTypes.func.isRequired,
    }

    constructor(props) {
        super(props)

        let people = props.people
        if (!people) {
            people = People.find().fetch()
        }
        this.peopleOptions = people.map((person) => ({
            notify: person.notify!=null ? person.notify : true,
            isMain: person.isMain!=null ? person.isMain : false,
            name: person.name,
            email: person.defaultEmail(),
            _id: person._id,
        })).map(person => ({label: person.name, value: person._id, ...person}))

        this.state = {
            selectedPeople: props.people ? this.peopleOptions : [],
        }
        if(this.state.selectedPeople.length && this.props.onSelectPeople) {
            this.props.onSelectPeople(
                this.state.selectedPeople.map(({_id, isMain, notify}) => ({
                    peopleId: _id,
                    isMainStakeholder: isMain,
                    notify,
                }))
            )
        }
    }

    selectMain = (mainId) => {
        this.state.selectedPeople.forEach(p => p.isMain = p._id === mainId)
        this.setState(prevState => prevState, () => {
            this.props.onSelectPeople(
                this.state.selectedPeople.map(({_id, isMain, notify}) => ({
                    peopleId: _id,
                    isMainStakeholder: isMain,
                    notify,
                }))
            )
        })
    }

    enableNotify = (_id, checked) => {
        this.state.selectedPeople.forEach(p => p._id === _id && (p.notify = checked))
        this.setState(prevState => prevState, () => {
            this.props.onSelectPeople(
                this.state.selectedPeople.map(({_id, isMain, notify}) => ({
                    peopleId: _id,
                    isMainStakeholder: isMain,
                    notify,
                }))
            )
        })
    }

    selectPeople = (people) => {
        !people.find(({isMain}) => isMain)
        && people.length
        && (people[0].isMain = true)
        this.setState({selectedPeople:people}, () => {
            this.props.onSelectPeople(
                this.state.selectedPeople.map(({_id, isMain, notify}) => ({
                    peopleId: _id,
                    isMainStakeholder: isMain,
                    notify,
                }))
            )
        })

    }

    renderMembers() {
        return (
            <table className='table table-condensed'>
                <thead>
                <tr>
                    <th>Name</th>
                    <th>Main Stakeholder</th>
                    <th>Notify</th>
                </tr>
                </thead>
                <tbody>
                {
                    this.state.selectedPeople.map(person => {
                        const {_id, name, email, isMain, notify} = person
                        return (
                            <tr key={_id}>
                                <td><div>{ name }</div><div>{email}</div></td>
                                <td>
                                    <div className='radio'>
                                        <label>
                                            <input
                                                type='checkbox'
                                                checked={isMain}
                                                onChange={() => this.selectMain(_id)}
                                            />
                                        </label>
                                    </div>
                                </td>
                                <td>
                                    <div className='radio'>
                                        <label>
                                            <input
                                                type='checkbox'
                                                checked={notify}
                                                onChange={(event) => this.enableNotify(_id, event.target.checked)}
                                            />
                                        </label>
                                    </div>
                                </td>
                            </tr>
                        )
                    })
                }
                </tbody>
            </table>
        )
    }

    render() {
        return (
            <div className='panel panel-default'>
                <div className='panel-heading'>
                    Add People
                </div>
                <div className='panel-body'>
                    <label>People</label>
                    <Select
                        multi
                        value={this.state.selectedPeople}
                        onChange={this.selectPeople}
                        options={this.peopleOptions}
                        className={'members-select'}
                    />
                    <div>
                        { this.renderMembers() }
                    </div>
                </div>
            </div>
        )
    }
}
