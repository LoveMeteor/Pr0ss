import React from 'react'
import ReactDOM from 'react-dom'

export default class DraggableImg extends React.Component {
    static displayName = 'DraggableImg'

    constructor(props) {
        super(props)
    }

    render() {
        return <img ref="img" draggable="true" onDragStart={this._onDragStart} {...this.props} />
    }

    _onDragStart = (event) => {
        const img = ReactDOM.findDOMNode(this.refs.img)
        const rect = img.getBoundingClientRect()

        const x = event.clientX - rect.left
        const y = event.clientY - rect.top

        event.dataTransfer.setDragImage(img, x, y)

        return
    }
}