import React, {Component} from 'react'
import KanbanColumn from './KanbanColumn'
class KanbanView extends Component {
	constructor() {
		super()
	}
	filterColumn(col, isSubStage) {
		return this.props.salesRecords.filter((deal) => {
			if (isSubStage) {
				return deal.subStage === col.id
			}
			return deal.stage === col.id
		})
	}
	render() {
		const { columns, salesRecords, isSubStage } = this.props
		const colSize = Math.floor(12 / columns.length)
		return (
			<div className="task-board-container">
				<div className="col-md-12">
					{columns.map((col) => {
						let data = this.filterColumn(col, isSubStage)
						data = _.sortBy(data, ({ createdAt }) => -createdAt.getTime())
						return (
							<KanbanColumn
								style={`col-md-${colSize}`}
								key={col.id}
								deals={data}
								isSubStage={isSubStage}
								colName={col.title}
								id={col.id}
							/>
						)
					})}
				</div>
			</div>
		)
	}
}
export default KanbanView
