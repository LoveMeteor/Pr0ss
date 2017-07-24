import React, { Component } from 'react'
import { getUserName, getAvatarUrl } from '../../../api/lib/filters'
import styled from 'styled-components'
import moment from 'moment'
import { SlackUsers } from '/imports/api/models'

class Massage extends Component{
  constructor(props){
    super(props)
    this.userName = props.message.author ? getUserName(props.message.author, true) : props.user
    this.formatMessage = this.formatMessage.bind(this)
  }

  renderFile(){
    const { message } = this.props
    if(!message.file) return
    const { file } = message
    const url = file.permalink

    if(/^image/.test(file.mimetype) && url){
      return <a href={url}>image permalink</a>
    }
  }

  formatMessage() {
    const { message } = this.props
    let formattedMessage = null
    // RENDER TEXT MESSAGE
    if (message.text) {
      message.text = message.text ? message.text.replace(/\<\@(.)+\|/, '<@') : ''
      formattedMessage = <div className='text'>{ message.text }</div>
    }
    // RENDER ATTACHMENT
    if (message.attachments && message.attachments.length > 0) {
      formattedMessage = (
        <div>
        {formattedMessage}
        {
          message.attachments.map( ({ text, pretext, title, id, color, title_link }) => {
            let url = /\<(\S+)\|(.+)\>/.exec(text)
            const Attachment = styled.div `
              padding-left: 10px;
              background-color: rgba(204,204,204,0.2);
              font-size: 0.9em;
              .content {
                padding-left: 10px;
                border-left: 3px solid #${color};
              }
            `
            return (
              <Attachment key={id}>
                <div>{ pretext }</div>
                <div className='content'>
                  <div><strong><a href={title_link} target='_blank'>{title}</a></strong></div>
                  {
                    url ? (
                      <a href={url[1]}>{url[2]}</a>
                    ) : (
                      <div>{_.unescape(text)}</div>
                    )
                  }
                </div>
              </Attachment>
            )
          })
        }
        </div>
      )
    }
    return formattedMessage
  }

  render() {
    const { message } = this.props
    return (
      <li className='activity-msg'>
        <div className='avatar'>
          <img src={ getAvatarUrl(message.author) } alt={this.userName}/>
        </div>
        <div className='info'>
          <span className='author'>{ this.userName }</span>
          <span className='date'>{ moment(message.createAt).format('dddd, MMMM Do YYYY, h:mm ') }</span>
        </div>
        { this.formatMessage() }
        { this.renderFile() }
      </li>
    )
  }
}

export default Massage

