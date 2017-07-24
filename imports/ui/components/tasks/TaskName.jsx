import React, { Component, PropTypes } from 'react'
import styled from 'styled-components'

class TaskName extends Component {
  constructor(props) {
    super()
    this.state = {
      editable: false,
      name: props.name,
      isUpdated: false,
    }
    this.changeState = this.changeState.bind(this)
    this.changeName = this.changeName.bind(this)
    this.initName = this.initName.bind(this)
  }

  changeName(event) {
    const name = event.target.value
    this.state.name = name
    this.props.onChange(name)
  }

  changeState(prop, propName, propValue) {
    prop[propName] = propValue
    this.setState(prevState => prevState)
  }

  initName() {
    if (!this.state.isUpdated && this.props.isNew) {
      this.state.isUpdated = true
      this.state.name = ''
      this.changeState(prevState => prevState)
    }
  }

  render() {
    const HeaderContainer = styled.div `
      position: relative;
    `
    const TitleContent = styled.div `
      position: relative;
      margin-left: 25px;
    `
    const TitleIcon = styled.div `
      position: absolute;
      width: 30px;
    `
    return (
      <HeaderContainer>
        <TitleIcon>
          <i className='fa fa-credit-card'/>
        </TitleIcon>
        <TitleContent onClick={() => this.changeState(this.state, 'editable', true)}>
          {
            (this.state.editable) ? (
              <input
                defaultValue={this.state.name}
                onChange={this.changeName}
                autoFocus={true}
                onFocus={this.initName}
                onBlur={() => this.changeState(this.state, 'editable', false)}
              />
            ) : (
              <input
                defaultValue={this.state.name}
              />
            )
          }
        </TitleContent>
      </HeaderContainer>
    )
  }
}

TaskName.propTypes = {
  name: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  isNew: PropTypes.bool.isRequired,
}

export default TaskName
