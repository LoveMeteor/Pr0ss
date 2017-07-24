import React, { Component, PropTypes } from 'react'
import moment from 'moment'
import styled from 'styled-components'
import TaskModifying from './TaskModifying.jsx'
import swal from 'sweetalert2'
import 'sweetalert2/dist/sweetalert2.min.css'

class Task extends Component {
  constructor(props) {
    super(props)

    this.showDetail = this.showDetail.bind(this)
    this.closeTask = this.closeTask.bind(this)
  }

  shortenName({ profile: { firstName, lastName } }) {
    return `${firstName} ${lastName}`
      .split(' ')
      .reduce((result, next) => `${result}${next.charAt(0)}`, '')
  }

  showDetail() {
    this.refs.taskModifying.showDetail()
  }

  closeTask(_id, event) {
    event.preventDefault()
    event.stopPropagation()
    swal({
      title: 'Are you sure?',
      text: 'You won\'t be able to revert this!',
      type: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, remove it!'
    }).then(() => {
      Meteor.call('task.remove', { _id }, (error) => {
        if (error) {
          const msg = error.reason ? error.reason : error.message
          swal('Delete task failed',  msg, 'warning')
        }
      })
      swal(
        'Removed!',
        'Your task has been removed.',
        'success'
      )
    })
  }

  render() {
    const AssigneeIcon = styled.div `
      width: 35px;
      height: 20px;
      background-color: #519839;
      text-align: center;
      font-weight: bold;
      border-radius: 3px;
      overflow-x: hidden;
      position: relative;
      float: right;
      margin-left: 2px;
      color: white;
    `
    const ApproverIcon = styled.div `
      width: 35px;
      height: 20px;
      background-color: #ccc;
      text-align: center;
      font-weight: bold;
      border-radius: 3px;
      overflow-x: hidden;
      position: relative;
      float: right;
      margin-left: 2px;
    `
    const DueDateIcon = styled(ApproverIcon) `
      float: left;
      width: 80px;
      background-color: ${this.props.task.dueDate.valueOf() >= Date.now() ? '#0079BF' : '#EB5A46'};
      color: white;
    `
    const CloseButton = styled.a `
      position: absolute;
      top: 0px;
      right: 5px;
      font-size: 1.5em;
      color: black;
    `
    return (
      <div
        className='task-container'
        onClick={ this.showDetail }
        draggable='true'
        onDragStart={ event =>
          event.dataTransfer.setData('task', JSON.stringify(this.props.task))
        }
      >
        <p>{ this.props.task.name }</p>
        <CloseButton onClick={event => this.closeTask(this.props.task._id, event)}>
          <i className='fa fa-times'/>
        </CloseButton>
        <AssigneeIcon>
          { this.shortenName(this.props.assignee) }
        </AssigneeIcon>
        <ApproverIcon>
          { this.props.approver ? this.shortenName(this.props.approver) : '?' }
        </ApproverIcon>
        <DueDateIcon>
          { moment(this.props.task.dueDate).format('YYYY/MM/DD') }
        </DueDateIcon>
        <TaskModifying
          ref='taskModifying'
          task={this.props.task}
          assignee={this.props.assignee}
          approver={this.props.approver}
          taskFolderId={this.props.taskFolderId}
          total={this.props.total}
        />
      </div>
    )
  }
}

Task.propTypes = {
  task: PropTypes.object.isRequired,
  approver: PropTypes.object,
  assignee: PropTypes.object.isRequired,
  taskFolderId: PropTypes.string,
  total: PropTypes.number.isRequired,
}

export default Task
