import '../models/users/users'
import _ from 'underscore'
import request from 'request'
import config from '../config'
import { APIError, TimeoutError } from './errors'
import {Threads, Messages} from '../models'
import {updateThread} from '../models/threads/methods'
import {updateMessage} from '../models/messages/methods'


const TimeoutErrorCodes = [0, 'ETIMEDOUT', 'ESOCKETTIMEDOUT', 'ECONNRESET', 'ENETDOWN', 'ENETUNREACH']
const PermanentErrorCodes = [400, 401, 402, 403, 404, 405, 500, 'ENOTFOUND', 'ECONNREFUSED', 'EHOSTDOWN', 'EHOSTUNREACH']
const CancelledErrorCode = [-123, 'ECONNABORTED']

let AccountStore = null

class NylasAPIRequest {
    constructor(api, options) {
        options.method = options.method || 'GET'
        options.url = options.path ? `${api.APIRoot}${options.path}` : options.url
        options.json = options.json || true
        options.timeout = options.timeout || 15000

        if (!(options.method === 'GET' || options.formData)) {
            options.body = options.body || {}
        }

        this.api = api
        this.options = options
    }

    run() {
        if(!this.options.auth) {
            if(!this.options.accountId) {
                const err = new APIError({
                    statusCode: 400,
                    body: 'Cannot make Nylas request without specifying `auth` or an `accountId`.'
                })
                return Promise.reject(err)
            }
            const token = this.api.accessTokenForAccountId(this.options.accountId)
            if(!token) {
                const err = new APIError({
                    statusCode: 400,
                    body: `Cannot make Nylas request for account ${this.options.accountId} auth token.`
                })
                return Promise.reject(err)
            }

            this.options.auth = {
                user: token,
                pass: '',
                sendImmediately: true
            }
        }


        return new Promise((resolve, reject) => {
            const req = request(this.options, (error, response, body) => {
                if(error || response.statusCode > 299) {
                    if(!response || !response.statusCode) {
                        response = response || {}
                        response.statusCode = TimeoutErrorCodes[0]
                    }
                    const apiError = new APIError({error, response, body, requestOptions: this.options})
                    if(this.options.error) this.options.error(apiError)

                    reject(apiError)
                } else {
                    if(this.options.success) this.options.success(body)
                    resolve(body)
                }
            })

            req.on('abort', () => {
                const cancelled = new APIError({
                    statusCode: CancelledErrorCode,
                    body: 'Request Aborted'
                })
                reject(cancelled)
            })

            if(this.options.started) {
                this.options.started(req)
            }
        })
    }
}

class NylasAPI {

    static TimeoutErrorCodes = TimeoutErrorCodes
    static PermanentErrorCodes = PermanentErrorCodes
    static CancelledErrorCode = CancelledErrorCode


    constructor() {
        this.AppID = config.nylas.appId
        this.AppSecret = config.nylas.appSecret
        this.APIRoot = config.nylas.apiRoot
    }

    accessTokenForAccountId (aid) {
        AccountStore = AccountStore || require('./account-store')
        return AccountStore.tokenForAccountId(aid)
    }

    makeRequest(options = {}) {
        //console.log("makeRequest", options);
        const success = (body) => { //console.log("========NyalsAPIRequest result", body);
            if(options.beforeProcessing) {
                body = options.beforeProcessing(body)
            }

            if(/*options.returnsModel*/Meteor.isClient) {
                return this.handleModelResponse(body).then((objects) => Promise.resolve(body))
            }
            return Promise.resolve(body)
        }

        const error = (err) => { console.error('=========NyalsAPIRequest error', err)
            /*handlePromise = Promise.resolve();
            if(err.response) {
                if(err.response.statusCode == 404 && options.returnsModel) {
                    handlePromise = this.handleModel404(options.url);
                }
                if(err.response.statusCode in [401,403]) {
                    handlePromise = this.handleAuthenticationFailure(options.url, options.auth?options.auth.user:null, options.body, err.response.statusCode);
                }
                if(err.response.statusCode == 400) {

                }
            }
            return handlePromise.finally(()=>{
                return Promise.reject(err);
            });*/
            return Promise.reject(err)
        }

        const req = new NylasAPIRequest(this, options)
        return req.run().then(success, error)
    }

    handleModelResponse(jsons) {

        if(!jsons) {
            return Promise.reject(new Error('handleModelResponse with no JSON provided'))
        }

        if(!(jsons instanceof Array)) {
            jsons = [jsons]
        }

        if(jsons.length == 0) {
            return Promise.resolve([])
        }

        const objName = jsons[0].object

        const uniquedJSONs = _.uniq(jsons, false, (model) => model.id)

        if(uniquedJSONs.length < jsons.length) {
            console.warn('NylasAPI::handleModelResponse: called with non-unique object set. Maybe an API request returned the same object more than once?')
        }

        const unlockedJSONs = _.filter(uniquedJSONs, (json) => 
            /*if(!this.lockTracker.acceptRemoteChangesTo(klass, json.id)) {
                if(json.delta) json.delta.ignoredBecause = "Model is locked, possibly because it's already been deleted.";
                return false;
            }*/
             true)

        if(unlockedJSONs.length == 0) {
            return Promise.resolve([])
        }
        if(objName!=='thread' && objName!=='message') return Promise.resolve(uniquedJSONs)

        // Update server database
        if(objName === 'thread') {
            // Update threads on the server database
            Threads.find({id:{$in:_.pluck(unlockedJSONs, 'id')}}).fetch().forEach((t) => {
                const thread = _.findWhere(unlockedJSONs, {id:t.id})
                if(t.version != thread.version) {
                    try {
                        updateThread.call({_id:t._id, ..._.extend(thread, {salesRecordId:t.salesRecordId})})
                        //console.log('updated thread on the server database')
                    } catch (err) {
                        console.error(err)
                    }
                }
            })
        } else if(objName === 'message') {
            // Update messages on the server database
            Messages.find({id:{$in:_.pluck(unlockedJSONs, 'id')}}).fetch().forEach((m) => {
                const message = _.findWhere(unlockedJSONs, {id:m.id})
                try {
                    updateMessage.call({_id:m._id, ...message})
                    //console.log('updated message on the server database')
                } catch (err) {
                    console.error(err, message)
                }
            })
        }

        // Update client database
        const ids = _.pluck(unlockedJSONs, 'id')
        const DatabaseStore = require('./database-store')
        return DatabaseStore.findObjects(objName, {id:{in:ids}}).then((models) => {
            const existingModels = {}
            models.forEach((model) => {
                existingModels[model.id] = model
            })
            const responseModels = [], changedModels = []

            unlockedJSONs.forEach((json) => {
                let model = existingModels[json.id]

                if(!model || (model.version && json.version && json.version>model.version) || !_.isEqual(model, json)) {
                    model = _.clone(json)
                    changedModels.push(model)
                }
                responseModels.push(model)
            })


            return DatabaseStore.persistObjects(objName, changedModels).then(() => Promise.resolve(responseModels))
        })
    }

    handleModel404(modelUrl) {
        return Promise.resolve()
    }

    handleAuthenticationFailure(modelUrl, apiToken, body, errorCode) {
        return Promise.resolve()
    }

    makeDraftDeletionRequest = (draft) => {
        if(!draft.id) return

        //this.incrementRemoteChangeLock(Message, draft.serverId)
        this.makeRequest({
            path: `/drafts/${draft.id}`,
            accountId: draft.account_id,
            method: 'DELETE',
            body: {version: draft.version},
            returnsModel: false
        })
        return
    }

}
module.exports = new NylasAPI()