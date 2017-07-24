import React from 'react'
import moment from 'moment'
import _ from 'underscore'
import { FlowRouter } from 'meteor/kadira:flow-router'
import { getAvatarUrl, getSlackUsername } from '../../../api/lib/filters'
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
        quote: React.PropTypes.object,
        salesRecord: React.PropTypes.object,
        draftClientId: React.PropTypes.string,
        saved: React.PropTypes.func
    }

    constructor(props){
        super(props)

        const defaultRevisionNumber = _.isArray(props.quote.revisions) ? props.quote.revisions.length : 0

        this.state = {
            currentFile: null,
            totalCost: '',
            revisionNumber: defaultRevisionNumber,
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
                return  warning('You can add only PDF files!')
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
        if(currentFile){
            return (
                <div className="attached-file">
                    <span className="file-name">{currentFile.name}</span>
                </div>
            )
        }
    }

    revisionNumberChange(event){
        const { quote } = this.props
        const { value: revisionNumber } = event.target
        if(revisionNumber > quote.revisions.length) return

        this.setState({revisionNumber: parseInt(revisionNumber)})
    }

    formSubmit(event){
        event.preventDefault()
        const { currentFile, totalCost, alertsActive, revisionNumber } = this.state
        const { salesRecord, usersArr, quote } = this.props
        if(!currentFile)return warning('You must add PDF file')
        if(totalCost === '')return warning('Empty total cost field')
        if(revisionNumber === '')return warning('Empty revision number field')

        const needUpdate = quote.revisions.some(revision => revision.revisionNumber === revisionNumber)
        const revisionData = {
            revisionNumber,
            quoteId: quote._id,
            totalPrice: parseFloat(totalCost),
            [needUpdate?'updateBy':'createBy']: Meteor.userId(),
            [needUpdate?'updateAt':'createAt']: moment().toDate(),
            fileName: currentFile.name,
            fileId: null
        }

        const slackMsgParans = {
            username: getSlackUsername(usersArr[Meteor.userId()]),
            icon_url: getAvatarUrl(usersArr[Meteor.userId()]),
            attachments: [
                {
                    'color': '#36a64f',
                    'text': `<${FlowRouter.url(FlowRouter.current().path)}|Go to project ${salesRecord.name}>`
                }
            ]
        }
        const slackText = `I just ${needUpdate?'updated':'added'} revision #${revisionNumber}"`
        const {draftClientId} = this.props
        const {selectedMailTemplate} = this.state
        const revisionCb = (err) => {
            if(this.props.saved) this.props.saved()
            info(`${needUpdate?'Update':'Add'} revision success!`)
            if(err) return warning(err.reason)
            //// step # 3 - notify slack/email
            Meteor.call('sendBotMessage', salesRecord.slackChanel, slackText, slackMsgParans)

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
            if (err) return warning(err.reason)
            this.setState({
                currentFile: null,
                quoteName: ''
            })
            info('Success upload file')
            revisionData.fileId = res.id

            // step # 2 - add new or update revision
            if(needUpdate) {
                Meteor.call('updateQuoteRevision', revisionData, revisionCb)
            }else{
                Meteor.call('addQuoteRevision', revisionData, revisionCb)
            }
        }
        // step # 1 - load pdf to FS
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
              onComplete(remoteFile) {
                remoteFile = JSON.parse(remoteFile)
                fileInsertCb(null, remoteFile )
              }
            }).upload()
          })
    }

    hide(){
        const { hide } = this.props
        if(typeof hide === 'function'){
            hide()
        }
    }

    totalChange(event){
        this.setState({totalCost: event.target.value})
    }

    toggleCheck(){
        const { alertsActive } = this.state
        this.setState({alertsActive: !alertsActive})
    }

    render() {
        const { totalCost, alertsActive, revisionNumber, showComposeModal, selectedMailTemplate, shouldCompileMailTemplate } = this.state
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

        const { quote } = this.props
        return (
            <div className="add-quote-form">
                <form className="default-form" onSubmit={this.formSubmit.bind(this)}>
                    <div className="field-wrap">
                        <span className="label">{quote.name}</span>
                    </div>
                    <div className="field-wrap">
                        <span className="label">Revision number </span>
                        <input type="number"
                               onChange={this.revisionNumberChange.bind(this)}
                               value={revisionNumber}/>
                    </div>

                    <div className="field-wrap">
                        <span className="label">Total cost ($)</span>
                        <input type="number"
                               onChange={this.totalChange.bind(this)}
                               value={totalCost}/>
                    </div>

                    <div className="field-wrap">
                        <span className="label">Add pdf file</span>
                        <label htmlFor="form-revision-quote-file"
                               className="file-label"/>
                        <input
                          type="file"
                          accept="application/pdf"
                          id="form-revision-quote-file"
                          onChange={this.changeFileInput}/>
                        {this.renderAttachedFile()}
                    </div>
                    {
                        draftClientId && (
                            <div>
                                <input type="checkbox"
                                       id="alert-checkbox"
                                       onChange={this.toggleCheck.bind(this)}
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
                          <button className="btnn primary-btn">Add revision</button>
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
            quote: this.props.quote.name,
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

        const draft = DraftStore.draftForClientId(this.props.draftClientId)

        this.setState({
            shouldCompileMailTemplate: false
        })
    }
}

export default AddQuoteForm
