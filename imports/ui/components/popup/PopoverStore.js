import React from 'react';
import ReactDOM from 'react-dom';
import Reflux from 'reflux';
import PopoverActions from './PopoverActions'
import FixedPopover from './FixedPopover'


const CONTAINER_ID = "nylas-popover-container";

function createContainer(id) {
    const element = document.createElement(id);
    document.body.appendChild(element);
    return element;
}

class PopoverStore extends Reflux.Store {

    constructor(containerId = CONTAINER_ID) {
        super()

        this.isOpen = false;
        this.container = createContainer(containerId);
        ReactDOM.render(<span />, this.container);

        this.listenTo(PopoverActions.openPopover, this.openPopover);
        this.listenTo(PopoverActions.closePopover, this.closePopover);
    }

    renderPopover = (child, props, callback)=> {
        const popover = (
            <FixedPopover {...props}>{child}</FixedPopover>
        );

        ReactDOM.render(popover, this.container, ()=> {
            this.isOpen = true;
            this.trigger();
            callback();
        });
    };

    openPopover = (element, {originRect, direction, fallbackDirection, callback = ()=> {}})=> {
        console.log('PopoverStore openPopover')
        const props = {
            direction,
            originRect,
            fallbackDirection,
        };

        if (this.isOpen) {
            this.closePopover(()=> {
                this.renderPopover(element, props, callback);
            })
        } else {
            this.renderPopover(element, props, callback);
        }
    };

    closePopover = (callback = ()=>{})=> {
        ReactDOM.render(<span/>, this.container, ()=> {
            this.isOpen = false;
            this.trigger();
            callback();
        });
    };

}

module.exports = new PopoverStore()
