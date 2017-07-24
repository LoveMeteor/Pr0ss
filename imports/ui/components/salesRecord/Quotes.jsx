import {Roles} from 'meteor/alanning:roles'
import React from 'react'
import {Modal} from 'react-bootstrap'
import classNames from 'classnames'
import AddQuoteForm from './AddQuoteForm'
import AddQuoteRevisionForm from './AddQuoteRevisionForm'
import currencyFormatter from 'currency-formatter'
import {info, warning} from '/imports/api/lib/alerts'
import {ROLES} from '/imports/api/models'
import _ from 'underscore'
import {DraftStore} from '/imports/api/nylas'
import moment from 'moment'

class QuoteItem extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      editQuoteNameMode: false,
    }
    this.downloadPDF = this.downloadPDF.bind(this)
  }

  renderQuoteName(quote) {
    const {editQuoteNameMode} = this.state
    if (!Roles.userIsInRole(Meteor.userId(), [ROLES.ADMIN, ROLES.SALES])) {
      return <p className="title">{quote.name}</p>
    }
    return (
      <p className="title">
        <span className={classNames('quote-name', {'hide': editQuoteNameMode})}
        onClick={this.changeEditMode.bind(this)}>{quote.name}</span>
        <input type="text"
          onKeyPress={this.changeQuoteName.bind(this)}
          onBlur={this.blurInput.bind(this)}
          className={classNames('quote-name-input', {'active': editQuoteNameMode})}
        />
      </p>
    )
  }

  changeEditMode(event) {
    if (!Roles.userIsInRole(Meteor.userId(), [ROLES.ADMIN, ROLES.SALES])) return
    event.persist()
    this.setState({editQuoteNameMode: true})
    setTimeout(() => {
      event.target.nextSibling.focus()
    }, 0)
  }

  blurInput(event) {
    event.target.velue = ''
    this.setState({editQuoteNameMode: false})
  }

  changeQuoteName(event) {
    const {quote} = this.props
    if (event.key === 'Enter') {
      Meteor.call('editQuoteName', quote._id, event.target.value, (err) => {
        if (err) return warning('Change quote name failed')
        info('Change quote name success!')
      })
      event.target.value = ''
      this.setState({editQuoteNameMode: false})
    }
  }

  addRevision() {
    const {quote, addRevision} = this.props
    addRevision(quote)
  }

  downloadPDF({ fileId }) {
    Meteor.call('drive.getFiles', { fileId }, (error, { webViewLink }) => {
      webViewLink && open(webViewLink, '_blank')
    })
  }

  render() {
    const {quote} = this.props
    const lastRevisionNumber = Math.max(...quote.revisions.map(item => item.revisionNumber))
    const latest = _.findWhere(quote.revisions, {revisionNumber: lastRevisionNumber})
    const revisions = quote.revisions
      .filter(revision => revision !== latest)
      .sort((a, b) => a.revisionNumber > b.revisionNumber ? -1 : 1)
      .map(revision => (
        <li className="revision-item"
          key={revision.fileId}>
          <p>Revision
            <span className="revision-label"> # {revision.revisionNumber}</span>
          </p>
          <p>
            <i className="fa fa-calendar-o"/>
            { moment(revision.createAt).format('MMMM Do YYYY')}
          </p>
          <p>
            Total price {currencyFormatter.format(revision.totalPrice, {
              code: 'USD',
              locale: 'en-US',
              decimalDigits: 1
            })}
          </p>
          <a
            download={revision.fileName}
            onClick={() => this.downloadPDF(revision)}
            className="btnn primary-btn"><i className="fa fa-download"/> PDF
          </a>
        </li>
      ))
      return (
        <li className="single-quota">
          <div className="flex-container">
            <div className="desc-part">
              {this.renderQuoteName(quote)}
              <p className="quote-info">
                  <span className="latest-label">latest version</span>
                  Revision <span className="revision-label"> # {latest.revisionNumber}</span></p>
              <p className="quote-info">
                  <i className="fa fa-calendar-o"/> {moment(latest.createAt).format('MMMM Do YYYY')}</p>
              <p className="quote-info">
                  Total price: {currencyFormatter.format(latest.totalPrice, {
                  code: 'USD',
                  locale: 'en-US',
                  decimalDigits: 0
              })}</p>
            </div>
            <div className="control-part">
              <button onClick={this.addRevision.bind(this, quote)}
                className="btnn primary-btn">
                <i className="fa fa-plus"/> REVISION
              </button>
              <a
                download={latest.fileName}
                onClick={() => this.downloadPDF(latest)}
                className="btnn primary-btn">
                <i className="fa fa-download"/> PDF</a>
            </div>
          </div>
          <div className="quote-revision">
            <ul className="revision-list">{revisions}</ul>
            {!_.isEmpty(revisions) && <span className="show-revisions"/>}
          </div>
        </li>
      )
  }
}

class Quotes extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      showPopup: false,
      popupData: null
    }
  }

  componentDidMount() {
    this.slideToggle = function (event) {
      const quote = event.currentTarget
      if ($(quote).hasClass('up')) {
        $(quote).removeClass('up')
        $(quote).siblings('.revision-list').slideUp()
      } else {
        $(quote).addClass('up')
        $(quote).siblings('.revision-list').slideDown()
        $(quote).parents('.single-quota').siblings('.single-quota').find('.revision-list').slideUp()
        $(quote).parents('.single-quota').siblings('.single-quota').find('.show-revisions').removeClass('up')
      }
    }

    $(document).on('click', '.show-revisions', this.slideToggle)
  }

  componentWillUnmount() {
    $(document).off('click', '.show-revisions', this.slideToggle)
  }

  hidePopup() {
    this.setState({showPopup: false, popupData: null})
  }

  showAddQuoteForm() {
    const {salesRecord, usersArr, currentUser, quotes} = this.props

    const to = salesRecord.noticeableContactsForStakeholders().map((c) => ({name: c.name, email: c.email}))
    if (to && to.length) {
      const salesRecordId = salesRecord._id
      DraftStore.createDraftForQuoteEmail({to, salesRecordId}).then((draft) => {
        this.setState({
          showPopup: true,
          popupTitle: 'Add new quote',
          popupData: <AddQuoteForm
          currentUser={currentUser}
          usersArr={usersArr}
          quotes={quotes}
          salesRecord={salesRecord}
          draftClientId={draft.clientId}
          saved={() => {
            this.setState({showPopup: false})
          }}
          />
        })
      })
    } else {
      this.setState({
        showPopup: true,
        popupTitle: 'Add new quote',
        popupData: <AddQuoteForm
        currentUser={currentUser}
        usersArr={usersArr}
        quotes={quotes}
        salesRecord={salesRecord}
        saved={() => {
          this.setState({showPopup: false})
        }}
        />
      })
    }
  }

  renderPopup() {
    const {popupData, showPopup, popupTitle} = this.state

    return (
      <Modal show={showPopup} onHide={() => {
        this.setState({showPopup: false})
      }}>
      <Modal.Header closeButton><Modal.Title>{popupTitle}</Modal.Title></Modal.Header>
      <Modal.Body>
      {popupData}
      </Modal.Body>
      </Modal>
    )
  }

  addRevision(quote) {
    const {salesRecord, usersArr, currentUser} = this.props

    const to = salesRecord.noticeableContactsForStakeholders().map((c) => ({name: c.name, email: c.email}))
    if (to && to.length) {
      const salesRecordId = salesRecord._id
      DraftStore.createDraftForQuoteEmail({to, salesRecordId}).then((draft) => {
        this.setState({
          showPopup: true,
          popupTitle: `Add revision to ${quote.name}`,
          popupData: <AddQuoteRevisionForm currentUser={currentUser}
          usersArr={usersArr}
          quote={quote}
          salesRecord={salesRecord}
          draftClientId={draft.clientId}
          saved={() => {
            this.setState({showPopup: false})
          }}/>
        })
      })
    } else {
      this.setState({
        showPopup: true,
        popupTitle: `Add revision to ${quote.name}`,
        popupData: <AddQuoteRevisionForm currentUser={currentUser}
        usersArr={usersArr}
        quote={quote}
        salesRecord={salesRecord}
        saved={() => {
          this.setState({showPopup: false})
        }}/>
      })
    }
  }

  renderQuotes() {
    const {quotes} = this.props
    if (_.isEmpty(quotes))return <div className="info-label"><p>No quotes yet</p></div>
      return (
        <ul
        className="quotes-list"
        >
        {
          quotes.map(quote =>
            <QuoteItem
              key={quote._id}
              addRevision={this.addRevision.bind(this)}
              quote={quote}/>
          )
        }
        </ul>
      )
  }

  renderAddQuotes() {
    if (!Roles.userIsInRole(Meteor.userId(), [ROLES.ADMIN, ROLES.SALES])) return null

    return (
      <div className="add-quotes">
        <button onClick={this.showAddQuoteForm.bind(this)}
          className="btnn primary-btn">Add quote
        </button>
      </div>
    )
  }

  getDriveFileList(e) {
    e.preventDefault()
    Meteor.call('getDriveFileList', (err, filesList) => {
      if (err) {
        console.log(err)
        return warning(err.message)
      }
      console.log('===get files list from google drive===')
      console.log(filesList)
      console.log('======================================')
    })
  }

  saveDriveFile(e) {
    e.preventDefault()
    if (e.target.files.length) {
      const file = e.target.files[0]
      const fileInfo = {
        name: file.name,
        type: file.type
      }
      const reader = new FileReader()
      reader.onload = function (fileLoadEvent) {
        Meteor.call('saveGoogleDriveFile', fileInfo, reader.result, (err, result) => {
          if (err) {
            console.log(err)
            return warning(err.message)
          }
          console.log('===file save result on google drive===')
          console.log(result)
          console.log('======================================')
        })
      }
      reader.readAsBinaryString(file)
    }
  }

  getGoogleDriveFileList() {
    if (!Roles.userIsInRole(Meteor.userId(), [ROLES.ADMIN, ROLES.SALES])) return null

    return (
      <div className="add-quotes">
        <button onClick={this.getDriveFileList.bind(this)}
          className="btnn primary-btn">Get google drive list of files
        </button>
      </div>
    )
  }

  saveFileToGoogleDrive() {
    if (!Roles.userIsInRole(Meteor.userId(), [ROLES.ADMIN, ROLES.SALES])) return null

    return (
      <div className="field-wrap">
        <span className="label">Add file to google Drive</span>
        <label htmlFor="quote-file"
          className="file-label"/>
        <input type="file"
          id="quote-file"
          onChange={this.saveDriveFile.bind(this)}/>
      </div>
    )
  }

  render() {
    return (
      <div className="project-quotes-tab">
      {this.renderPopup()}
      {this.renderQuotes()}
      {this.renderAddQuotes()}
      {this.getGoogleDriveFileList()}
      {this.saveFileToGoogleDrive()}
      </div>
    )
  }
}

export default  Quotes
