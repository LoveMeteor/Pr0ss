import React, { Component, PropTypes } from 'react'
import styled from 'styled-components'
import Toggle from 'react-toggle'
import { ReactiveDict } from 'meteor/reactive-dict'
import 'react-toggle/style.css'

class TaskFilter extends Component {
  constructor(props) {
    super(props)
    const { taskFilter } = props
    this.state = {
      filters: {
        AssignToMe: taskFilter.get('AssignToMe'),
        IamApprover: taskFilter.get('IamApprover'),
        DueDate: taskFilter.get('DueDate'),
        Today: taskFilter.get('Today'),
        Tomorrow: taskFilter.get('Tomorrow'),
      },
    }
    this.changeState = this.changeState.bind(this)
  }

  changeState(prop, propName, propValue) {
    prop[propName] = propValue
    this.setState(prevState => prevState)
    this.props.taskFilter.set(propName, propValue)
  }

  render() {
    const ToggleButton = styled.label `
      padding: 0 20px;
      .react-toggle-track {
        width: 30px;
        height: 18px;
      }
      .react-toggle-thumb {
        width: 15px;
        height: 15px;
      }
      .react-toggle--checked .react-toggle-thumb {
        left: 13px;
      }
      .react-toggle {
        top: 4px;
      }
      span {
        font-size: 14px;
        padding-left: 3px;
      }
    `
    return (
      <div className='col-md-12' style={{textAlign: 'center'}}>
        <ToggleButton>
          <Toggle
            defaultChecked={this.state.filters.AssignToMe}
            icons={false}
            onChange={event => this.changeState(this.state.filters, 'AssignToMe', event.target.checked)}/>
          <span>Assigned to me</span>
        </ToggleButton>

        <ToggleButton>
          <Toggle
            defaultChecked={this.state.filters.IamApprover}
            icons={false}
            onChange={event => this.changeState(this.state.filters, 'IamApprover', event.target.checked)}/>
          <span>I am approver</span>
        </ToggleButton>

        <ToggleButton>
          <Toggle
            defaultChecked={this.state.filters.DueDate}
            icons={false}
            onChange={event => this.changeState(this.state.filters, 'DueDate', event.target.checked)}/>
          <span>Due date Tasks</span>
        </ToggleButton>

        <ToggleButton>
          <Toggle
            defaultChecked={this.state.filters.Today}
            icons={false}
            onChange={event => this.changeState(this.state.filters, 'Today', event.target.checked)}/>
          <span>Today tasks</span>
        </ToggleButton>

        <ToggleButton>
          <Toggle
            defaultChecked={this.state.filters.Tomorrow}
            icons={false}
            onChange={event => this.changeState(this.state.filters, 'Tomorrow', event.target.checked)}/>
          <span>Tomorrow tasks</span>
        </ToggleButton>
      </div>
    )
  }
}

TaskFilter.propTypes = {
  taskFilter: PropTypes.instanceOf(ReactiveDict),
}

export default TaskFilter
