import React from 'react'
import {Badge} from 'react-bootstrap'
import Utils from '../../utils/Utils'

class ItemCategory extends React.Component {
    /*static propTypes = {
        category: React.PropTypes.object.required,
        onClick: React.PropTypes.func,
        selected: React.PropTypes.bool
    }*/

    constructor(props) {
        super(props)
    }

    render() {
        const {category} = this.props
        return (
            <div
                style={{display:'flex'}}
                className={`item${this.props.selected ? ' focused' : ''}`}
                onClick={(evt) => {
                    this.props.onClick(evt)
                }}>
                <span><img src={Utils.iconForCategory(category)} width="16px"/></span>&nbsp;
                <span style={{flex:1}}>{category.display_name}</span>
                {category.unreads>0 && <Badge pullRight>{category.unreads}</Badge>}
            </div>
        )
    }
}

export default ItemCategory
