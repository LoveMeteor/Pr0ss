import React, { Component, PropTypes } from 'react'
import styled from 'styled-components'
import TaskDetail from './TaskDetail.jsx'

class TaskAdding extends Component {
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
    const TaskAdding = styled.div `
      font-size: 13px;
      padding: 5px;
      &:hover {
        background-color: #CDD2D4;
        cursor: pointer;
      }
    `
    return (
      <TaskAdding onClick={ this.showDetail }>
        + Add a task ...
        <TaskDetail
          showDetail={this.showDetail}
          hideDetail={this.hideDetail}
          isShown={this.state.task.showDetail}
          status={this.props.status}
          isNew={true}
          taskFolderId={this.props.taskFolderId}
          total={this.props.total}
        />
      </TaskAdding>
    )
  }
}

TaskAdding.propTypes = {
  status: PropTypes.string.isRequired,
  taskFolderId: PropTypes.string,
  total: PropTypes.number.isRequired,
}

export default TaskAdding
