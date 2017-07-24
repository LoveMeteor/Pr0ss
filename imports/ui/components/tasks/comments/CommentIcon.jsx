import React, { Component, PropTypes } from 'react'
import styled from 'styled-components'

class CommentIcon extends Component {
  constructor() {
    super()
  }

  render() {
    const CommentIcon = styled.div `
      text-align: center;
      line-height: 30px;
      border-radius: 5px;
      background-color: #D6DADC;
      font-size: 10px;
      color: #4d4d4d;
      margin-right: 10px;
      width: 30px;
      height: 30px;
      float: left;
      text-overflow: ellipsis;
      overflow: hidden;
      padding: 1px;
      font-weight: 800;
    `
    return (
      <CommentIcon>
      { this.props.name }
      </CommentIcon>
    )
  }
}

CommentIcon.propTypes = {
  name: PropTypes.string.isRequired,
}

export default CommentIcon
