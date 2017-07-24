/* global FlowRouter, moment */
import React, {Component} from 'react'
import styled from 'styled-components'

class KanbanItem extends Component {

	render() {
		const DueDateIcon = styled.div `
      width: 35px
      height: 20px
      background-color: #6d6d6d
      text-align: center
      font-weight: bold
      border-radius: 3px
      overflow-x: hidden
      position: relative
      float: right
      margin-left: 2px
      float: left
      width: 80px
      color: white
    `
		const { _id, name, createdAt } = this.props.deal
		return (
			<div className="task-container"
				onClick={() => {FlowRouter.go('SalesRecord', {id: _id})} }
				draggable='true'
				onDragStart={ event => {
					event.dataTransfer.setData('deal', JSON.stringify(this.props.deal))
				}}
			>
				<p>{name}</p>
	      <DueDateIcon>
          { moment(createdAt).format('MM/DD/YYYY') }
        </DueDateIcon>
			</div>
		)
	}
}
export default KanbanItem
