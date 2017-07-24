import React, { Component, PropTypes } from 'react'
import TaskDetail from './TaskDetail.jsx'

class TaskModifying extends Component {
  constructor() {
    super()
    this.state = {
      task: {
        showDetail: false,
      },
    }

    this.showDetail = this.showDetail.bind(this)
    this.hideDetail = this.hideDetail.bind(this)
  }

  showDetail() {
    this.setState({
      task: {
        showDetail: true,
      },
    })
  }

  hideDetail() {
    this.setState({
      task: {
        showDetail: false,
      },
    })
  }

  render() {
    const task = _.clone(this.props.task)
    task.assignee = this.props.assignee
    task.approver = this.props.approver
    return (
      <TaskDetail
        showDetail={this.showDetail}
        hideDetail={this.hideDetail}
        isShown={this.state.task.showDetail}
        status={task.status}
        isNew={false}
        task={task}
        key={task._id}
        taskFolderId={this.props.taskFolderId}
        total={this.props.total}
      />
    )
  }
}

TaskModifying.propTypes = {
  task: PropTypes.object.isRequired,
  assignee: PropTypes.object.isRequired,
  approver: PropTypes.object,
  taskFolderId: PropTypes.string,
  total: PropTypes.number.isRequired,
}

export default TaskModifying
