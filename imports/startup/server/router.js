import bodyParser from 'body-parser'
import {Picker} from 'meteor/meteorhacks:picker'
import NylasAPI from '/imports/api/nylas/nylas-api'
import {Threads, Messages, NylasAccounts} from '/imports/api/models'

Picker.middleware(bodyParser.json())
Picker.middleware(bodyParser.urlencoded({extended: false}))

Picker.filter((req, res) => req.method == 'POST').route('/api/voice', (params, req, res, next) => {

    const twilio = require('twilio')
    const config = require('../../api/config')

    const twiml = new twilio.TwimlResponse()

    twiml.dial(req.body.number, {
        callerId: config.twilio.phoneNumber
    })

    res.writeHead(200, {
        'Content-Type': 'text/xml'
    })

    res.end(twiml.toString())
})

Picker.filter((req, res) => req.method == 'GET').route('/api/download', (params, req, res, next) => {
    const query = params.query
    const request = require('request')
    request.get(`https://api.nylas.com/files/${query.file_id}/download`, {
        auth: {
            user: query.access_token,
            password: '',
            sendImmediately: true
        }
    })
        .on('response', (response) => {
            if(response.statusCode == 200) {
                const clean = require('../../api/lib/validate-http-headers')
                let headers = {
                    'Content-Disposition': response.headers['content-disposition'],
                    'Content-Type': response.headers['content-type'],
                    'Content-Length': response.headers['content-length']
                }
                headers = clean(headers)

                res.writeHead(200, headers)
            } else {
                res.write('Can not download file')
            }

        })
        .pipe(res)
})

const bound = Meteor.bindEnvironment((callback) => callback())
Picker.route('/callback/nylas/message.created', (params, req, res, next) => {
    const query = params.query

    console.log('===> Nylas WebHook request body', query, JSON.stringify(req.body))
    const deltas = req.body.deltas
    if(deltas && deltas.length) {
        const data = deltas[0]
        if(data && data.object_data) {
            const account_id = data.object_data.account_id
            const message_id = data.object_data.id
            const attributes = data.object_data.attributes
            if(attributes) {
                const thread_id = attributes.thread_id

                if(account_id && thread_id && message_id) {
                    console.log('Started fetch threads', account_id, thread_id, message_id)
                    const nylasAccount = NylasAccounts.findOne({accountId:account_id})
                    if(nylasAccount) {
                        const {accessToken} = nylasAccount

                        const auth = {
                            user: accessToken,
                            pass: '',
                            sendImmediately: true
                        }
                        NylasAPI.makeRequest({
                            path: `/threads/${thread_id}`,
                            method: 'GET',
                            auth
                        }).then((thread) => {
                            NylasAPI.makeRequest({
                                path: `/messages/${message_id}`,
                                method: 'GET',
                                auth
                            }).then((message) => {
                                bound(() => {
                                    const existingThreads = Threads.find({id:thread_id}).fetch()
                                    if(existingThreads && existingThreads.length) {
                                        Threads.update({id:thread_id}, {$set:thread})

                                        const existingMessage = Messages.findOne({id:message.id})
                                        if(!existingMessage) {
                                            Messages.insert(message)
                                        }
                                    }

                                    Meteor.call('sendMailToSlack', message)
                                })
                            })
                        })
                    }


                }
            }
        }
    }
    res.end(query.challenge)
})