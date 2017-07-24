import { drive } from '/imports/api/drive/methods/drive'
import { WebApp } from 'meteor/webapp'
import { Random } from 'meteor/random'
import { SalesRecords, Projects } from '/imports/api/models'
import { slackClient } from '/imports/api/slack'
import bodyParser from 'body-parser'
import { Mongo } from 'meteor/mongo'
import SimpleSchema from 'simpl-schema'

const { public: { env } } = Meteor.settings
const ChangedFiles = new Mongo.Collection(null)
const SlackFiles = new Mongo.Collection(null)
ChangedFiles.attachSchema(
  new SimpleSchema({
    _id: String,
    time: String,
    removed: Boolean,
  })
)
SlackFiles.attachSchema(
  new SimpleSchema({
    _id: String,
    channel: String,
    file: {
      type: Object,
      blackbox: true,
    },
    nComments: Number,
  })
)

const countComments = (fileId) => {
  const getCommentSync = Meteor.wrapAsync(drive.comments.list)
  let nComments = 0
  let commentList = getCommentSync({ fileId, pageSize: 100, fields: '*' })
  nComments += commentList.comments.length
  while (commentList.nextPageToken) {
    commentList = getCommentSync({ fileId, pageSize: 100, fields: '*' })
    nComments += commentList.comments.length
  }
  return nComments
}



let {
  startPageToken: pageToken
} = Meteor.wrapAsync(drive.changes.getStartPageToken)()


WebApp.connectHandlers.use(bodyParser.json())
WebApp.connectHandlers.use('/notifications',Meteor.bindEnvironment((req, res ) => {
  const listChangeSync = Meteor.wrapAsync(drive.changes.list)
  const result = listChangeSync({
    pageToken,
    pageSize: 100,
  })
  pageToken = result.newStartPageToken
  result.changes.forEach(({ fileId, time, removed, file }) => {
    if (fileId && file && file.mimeType != 'application/vnd.google-apps.folder') {
      if (!ChangedFiles.findOne(fileId)) {
        ChangedFiles.insert({
          _id: fileId,
          time,
          removed,
        })
      }
    }
  })
  res.writeHead(200)
  res.end(`Hello world from: ${Meteor.release}`)
}))


export const observeGoogleFile = function() {
  // GET ANCESTORS
  const getAncestors = (fileId) => {
    const ancestors = []
    const getFileWithParent = (fileId) => {
      const getFileSync = Meteor.wrapAsync(drive.files.get)
      const {id, name, webViewLink, parents} = getFileSync({ fileId, fields: 'id,name,webViewLink,parents' })
      if (parents && parents.length) {
        return { id, name, webViewLink, parentId: _.first(parents) }
      }
      return null
    }
    let fileWithParent = getFileWithParent(fileId)
    while(fileWithParent) {
      ancestors.push(fileWithParent)
      fileWithParent = getFileWithParent(fileWithParent.parentId)
    }
    return ancestors
  }
  // DETECT SLACK CHANNEL AND SEND
  ChangedFiles.find().fetch().forEach(({ _id }) => {
    if (!SlackFiles.findOne(_id)) {
      const ancestors = getAncestors(_id)
      const folderIds = ancestors.map(({ parentId }) => parentId)
      const project = SalesRecords.findOne({ folderId: { $in: folderIds } }) || Projects.findOne({ folderId: { $in: folderIds } })
      if (project && project.slackChanel) {
        SlackFiles.insert({
          _id,
          channel: project.slackChanel,
          file: ancestors.find(({ id }) => id == _id),
          nComments: countComments(_id),
        })
      }
    }
    const slackFile = SlackFiles.findOne(_id)
    if (slackFile && slackFile.channel) {
      let text = null
      const nComments = countComments(slackFile._id)
      console.log(nComments)
      console.log(slackFile.nComments)
      if (nComments > slackFile.nComments) {
        text = `${nComments - slackFile.nComments} comments has been added to file <${slackFile.file.webViewLink}|${slackFile.file.name}>`
        SlackFiles.update(_id, {
          $set: {
            nComments,
          }
        })
      } else {
        text = `file <${slackFile.file.webViewLink}|${slackFile.file.name}> has been edited`
      }
      slackClient.chat.postMessage({
        channel: slackFile.channel,
        text
      })
      console.log(`--> Send message to slack channel`)
      console.log(slackFile)
    }
  })
  ChangedFiles.remove({})
}

export const registerCallback = function() {
  drive.changes.watch({
    pageToken,
    resource: {
      id: Random.id(),
      address: env === 'development' ? 'https://9e1347ca.ngrok.io/notifications' : Meteor.absoluteUrl('notifications'),
      type: 'web_hook'
    }
  })
}

registerCallback()
