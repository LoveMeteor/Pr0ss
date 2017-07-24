import React from 'react'
import PeopleList from '../components/people/PeopleList'


export default class PeoplePage extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            showPersonModal: false,
            creating: false,
            selectedPerson: null,
            updatedPerson: null,
            removedPerson: null
        }
    }

    render() {
        return (
            <div className="contact-page">
                <PeopleList  />
            </div>
        )
    }
}
