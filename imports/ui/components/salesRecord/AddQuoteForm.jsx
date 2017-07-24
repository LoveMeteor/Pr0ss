import React from 'react'
import { FlowRouter } from 'meteor/kadira:flow-router'
import {Alert} from 'react-bootstrap'
import { getSlackUsername, getAvatarUrl } from '../../../api/lib/filters'
import { warning, info } from '/imports/api/lib/alerts'
import TemplateSelect from '../mailtemplates/TemplateSelect'
import TemplateOverview from '../mailtemplates/TemplateOverview'
import {NylasUtils, RegExpUtils, Actions, DraftStore} from '/imports/api/nylas'
import ComposeModal from '../inbox/composer/ComposeModal'
import MediaUploader from '../libs/MediaUploader'
import {MailTemplates} from '/imports/api/models'

class AddQuoteForm extends React.Component{
  static propTypes = {
    currentUser: React.PropTypes.object,
    usersArr: React.PropTypes.object,
    quotes: React.PropTypes.array,
    salesRecord: React.PropTypes.object,
    draftClientId: React.PropTypes.string,
    saved: React.PropTypes.func
  }

  constructor(props){
    super(props)

    this.state = {
      currentFile: null,
      quoteName: '',
      totalCost: '',
      alertsActive: true,
      isUploading: false,
      selectedMailTemplate: MailTemplates.findOne({isDefault:true}),
      shouldCompileMailTemplate: true
    }
  }

  componentDidMount() {
    Meteor.call('drive.getAccessToken', {}, (error, token) => {
      if (error) return warning('could not connect to google drive')
      this.token = token
    })
  }

  changeFileInput = (event) => {
    if(event.target.files.length){
      if(event.target.files[0].type !== 'application/pdf') {
        return warning('You can add only PDF files!')
      }

      const file = event.target.files[0]
      this.setState({
        currentFile: file
      })

      if(this.props.draftClientId) {
          Actions.addAttachment({clientId: this.props.draftClientId, file})
      }
    }
  }

  renderAttachedFile(){
    const { currentFile } = this.state
    if(!currentFile) return null

    return (
      <div className="attached-file">
      <span className="file-name">{currentFile.name}</span>
      </div>
    )
  }

  onChangeTitle = (event) => {
    this.setState({quoteName: event.target.value})
  }

  formSubmit(event){
    event.preventDefault()

    const { currentFile, quoteName, totalCost, alertsActive } = this.state
    const { salesRecord, usersArr } = this.props
    if(!currentFile)return warning('You must add PDF file')
    if(quoteName === '')return warning('Empty quote name')
    if(totalCost === '')return warning('Empty total cost field')

    const quoteData = {
      name: quoteName,
      createAt: new Date(),
      projectId: salesRecord._id,
      revisions: [
        {
          revisionNumber: 0,
          totalPrice: parseFloat(totalCost),
          fileName: currentFile.name,
          fileId: null,
          createBy: Meteor.userId(),
          createAt: new Date(),
        }
      ],
    }

    const {draftClientId} = this.props
    const {selectedMailTemplate} = this.state
    const addQuoteCb = (err) => { console.log(this.props)
      if(err) return console.log(err)

      if(this.props.saved) this.props.saved()
      info('Add new quote')

      if(alertsActive && draftClientId && selectedMailTemplate) {
        const draftInterval = setInterval(() => {
          if(!DraftStore.isUploadingDraftFiles(draftClientId)) {
              Actions.sendDraft(draftClientId)
              clearInterval(draftInterval)
          }
        }, 5000)
      }
    }

    const fileInsertCb = (err, res) => {
      if (err) return console.log(err)
      this.setState({
        currentFile: null,
        quoteName: ''
      })

      quoteData.revisions[0].fileId = res.id
      Meteor.call('addNewQuote', quoteData, addQuoteCb)

      if(typeof salesRecord.slackChanel === 'undefined') return

      const params = {
        username: getSlackUsername(usersArr[Meteor.userId()]),
        icon_url: getAvatarUrl(usersArr[Meteor.userId()]),
        attachments: [
          {
            'color': '#36a64f',
            'text': `<${FlowRouter.url(FlowRouter.current().path)}|Go to project ${salesRecord.name}>`
          }
        ]
      }

      const slackText = `I just added new quote "${quoteData.name}"`

      Meteor.call('sendBotMessage', salesRecord.slackChanel, slackText, params)
    }

    this.setState({ isUploading: true })
    Meteor.call(
      'drive.listFiles',
      { query: `'${salesRecord.folderId}' in parents and name = 'CLIENT QUOTE'` },
      (error, { files }) => {
        if (error) return alert('folder CLIENT QUOTE is not found!')
        const clientQuoteId = _.first(files).id
        new MediaUploader({
          file: currentFile,
          token: this.token,
          metadata: {
            parents: [clientQuoteId],
          },
          params: {
            fields: '*'
          },
          onComplete: (remoteFile) => {
            remoteFile = JSON.parse(remoteFile)
            fileInsertCb(null, remoteFile )
          }
        }).upload()
      })
  }

  onChangeCost = (event) => {
    this.setState({totalCost: event.target.value})
  }

  toggleAlertStakeholders = () => {
    const { alertsActive } = this.state
    this.setState({alertsActive: !alertsActive})
  }

  render() {
    const { quoteName, totalCost, alertsActive, showComposeModal, selectedMailTemplate, shouldCompileMailTemplate } = this.state
    const {draftClientId} = this.props
    let templateData

    if(draftClientId) {
      if(shouldCompileMailTemplate && selectedMailTemplate) {
        templateData = this.compileTemplate(selectedMailTemplate)
      } else {
        const draft = DraftStore.draftForClientId(this.props.draftClientId)
        templateData = {
          subject: draft.subject,
          body: draft.body
        }
      }
    }

    return (
        <div className="add-quote-form">
            <form className="default-form" onSubmit={this.formSubmit.bind(this)}>
                <div className="field-wrap">
                    <span className="label">Quote title</span>
                    <input type="text"
                           onChange={this.onChangeTitle}
                           value={quoteName}/>
                </div>
                <div className="field-wrap">
                    <span className="label">Total price ($)</span>
                    <input type="number"
                           onChange={this.onChangeCost}
                           value={totalCost}/>
                </div>
                <div className="field-wrap">
                    <span className="revision-field">Revision # <span className="revision-label">0</span></span>
                </div>

                <div className="field-wrap">
                    <span className="label">Add pdf file</span>
                    <label htmlFor="form-quote-file"
                         className="file-label"/>
                    <input type="file"
                       id="form-quote-file"
                       accept="application/pdf"
                       onChange={this.changeFileInput}/>
                    {this.renderAttachedFile()}
                </div>
                {
                    draftClientId && (
                        <div>
                            <input type="checkbox"
                                   id="alert-checkbox"
                                   onChange={this.toggleAlertStakeholders}
                                   checked={alertsActive}
                                   className="hidden-checkbox"/>
                            <label htmlFor="alert-checkbox"
                                   className="check-label">Alert stakeholders</label>
                            {alertsActive && (NylasUtils.hasNylasAccounts() ? <TemplateSelect onChange={this.onSelectMailTemplate} selectedTemplate={selectedMailTemplate}/> : <Alert bsStyle="warning">You need to set inbox to email!</Alert>)}
                            {alertsActive && selectedMailTemplate && (
                                <div style={{position:'relative'}}>
                                    <TemplateOverview template={templateData}/>
                                    <i className="fa fa-edit" style={{position:'absolute',top:5,right:5}} onClick={this.onClickEditMail}></i>
                                    <ComposeModal isOpen={showComposeModal}
                                                  clientId={this.props.draftClientId}
                                                  onClose={this.onCloseComposeModal}
                                                  lazySend={true}
                                    />
                                </div>
                            )}
                        </div>
                    )
                }

                <div className="submit-wrap">
                    {
                      (this.state.isUploading) ? (
                        <button className="btnn primary-btn"><i className="fa fa-spinner fa-spin fa-2x fa-fw"/></button>
                      ) : (
                        <button className="btnn primary-btn">Add quote</button>
                      )
                    }
                </div>
            </form>
        </div>
    )
  }

  onSelectMailTemplate = (template) => {
    this.setState({
      selectedMailTemplate: template,
      shouldCompileMailTemplate: true
    })
  }

  compileTemplate = (template) => {
    if(!template || !this.props.draftClientId) return

    const tplData = {
      project: this.props.salesRecord.name,
      quote: this.state.quoteName,
      cost: this.state.totalCost
    }

    const compiledData = {
      subject: RegExpUtils.compileTemplate(template.subject, tplData),
      body: RegExpUtils.compileTemplate(template.body, tplData)
    }

    DraftStore.changeDraftForClientId(this.props.draftClientId, compiledData)

    return compiledData
  }

  onClickEditMail = () => {
    this.setState({showComposeModal:true})
  }

  onCloseComposeModal = () => {
    this.setState({showComposeModal:false})

    if(!this.props.draftClientId) return

    DraftStore.draftForClientId(this.props.draftClientId)

    this.setState({
      shouldCompileMailTemplate: false
    })
  }
}

export default AddQuoteForm
