import React, { Component, PropTypes } from 'react'
import styled from 'styled-components'

class TaskError extends Component {
  constructor() {
    super()
  }

  render() {
    const ErrorContainer = styled.div `
      .alert {
        padding: 6px;
        font-size: 14px;
      }
    `
    return (
      <ErrorContainer>
        {
          (this.props.errors.length > 0) ? (
            <div className='alert alert-danger'>
              {
                this.props.errors.map(error => <li key={error}>{ error }</li>)
              }
            </div>
          ) : ''
        }
      </ErrorContainer>
    )
  }
}

TaskError.propTypes = {
  errors: PropTypes.array.isRequired,
}

export default TaskError
