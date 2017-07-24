import React, {Component} from 'react'
import Select from 'react-select'
import {
  SUB_STAGES_LEAD,
  SUB_STAGES_OPP,
  SUB_STAGES_ORDER,
  SUB_STAGE_TICKET
} from '../../../../api/constants/project'

class SelectSubStage extends Component {
  constructor() {
    super()
    this.getSubStages = this.getSubStages.bind(this)
    this.changeSelectionValue = this.changeSelectionValue.bind(this)
    this.state = {
      subStage: ''
    }
  }
  componentWillMount() {
    const {update, subStage} = this.props
    if (update) {
      this.setState({subStage: subStage})
    } else {
      const stages = this.getSubStages()
      if (!_.isEmpty(stages)) {
        this.setState({subStage: stages[0]})
        this.props.onSelectSubStage(stages[0])
      }
    }
  }
  componentWillReceiveProps(props) {
    if (this.props.stage !== props.stage) {
      if (props.update) {
        this.setState({subStage: props.subStage})
      } else {
        const stages = this.getSubStages(props.stage)
        this.setState({subStage: stages[0]})
      }
    }
  }
  getSubStages(stage) {
    if (!stage) stage = this.props.stage
    switch (stage) {
      case 'lead': return SUB_STAGES_LEAD
      case 'opportunity': return SUB_STAGES_OPP
      case 'order': return SUB_STAGES_ORDER
      case 'ticket': return SUB_STAGE_TICKET
      default: return []
    }
  }
  changeSelectionValue(value) {
    this.setState({subStage: value})
    this.props.onSelectSubStage(value)
  }
  render() {
    const { style = '', update = false } = this.props
    return (
        <Select
          className={style}
          value={this.state.subStage}
          onChange={this.changeSelectionValue}
          options={this.getSubStages()}
          clearable={false}
        />
    )
  }
}

export default SelectSubStage
