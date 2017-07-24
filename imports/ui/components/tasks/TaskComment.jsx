import React, { Component, PropTypes } from 'react'
import Textcomplete from 'textcomplete/lib/textcomplete'
import Textarea from 'textcomplete/lib/textarea'
import CommentList from './comments/CommentList.jsx'
import CommentIcon from './comments/CommentIcon.jsx'

class TaskComment extends Component {
  constructor() {
    super()
    this.state = {
      comment: {
        content: '',
      },
    }
    this.addComment = this.addComment.bind(this)
  }

  shortenName({ profile: { firstName, lastName } }) {
    return `${firstName} ${lastName}`
      .split(' ')
      .reduce((result, next) => `${result}${next.charAt(0)}`, '')
  }

  componentDidMount() {
    setTimeout(() => {
      this.subscriber = Meteor.subscribe(
        'task.details', {
          _id: this.props.task._id,
        }
      )
    }, 500)
    const editor = new Textarea(this.refs.comment)
    const textComplete = new Textcomplete(editor)
    textComplete.register([
      {
        match: /(^|\s)@(.*)$/,
        search(term, callback) {
          Meteor.call('task.findUsers', {
            keyword: term,
            ignore: '',
          }, (error, users) => {
            if (!error) {
              callback(
                users.map(({ username }) => username)
              )
            }
          })
        },
        replace(value) {
          return `@${value}`
        },
      },
    ])
  }

  componentWillUnmout() {
    setTimeout(() => {
      this.subscriber && this.subscriber.stop()
    }, 500)
  }

  addComment(event) {
    event.preventDefault()
    const commentElem = event.target.previousSibling
    const content = commentElem.value
    Meteor.call('task.addComment', { content, _id: this.props.task._id }, error => {
      if (!error) {
        commentElem.value = ''
      }
    })
  }

  render() {
    return (
      <div className='hide'>
        <p>
          <strong><i className='fa fa-comment-o'/>&nbsp;&nbsp; Add Comment</strong>
        </p>
        <div className='task-comment-box'>
          <CommentIcon name={this.shortenName(Meteor.user())}/>
          <div className='task-comment-content'>
            <textarea
              ref='comment'
              className='comment-textarea'
              placeholder={'Write a comment ...'}
            />
            <button
              onClick={this.addComment}
              className='btn btn-default btn-sm send-button'>
              Send
            </button>
          </div>
        </div>
        <p>
          <strong><i className='fa fa-align-left'/>&nbsp;&nbsp; Activity</strong>
        </p>
        <p><strong>{(this.props.task.comments || []).length} &nbsp;&nbsp; Comments</strong></p>
        <CommentList comments={this.props.task.comments || []} taskId={this.props.task._id}/>
      </div>
    )
  }
}

TaskComment.propTypes = {
  task: PropTypes.object.isRequired,
}

export default TaskComment
