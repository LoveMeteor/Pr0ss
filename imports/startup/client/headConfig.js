import { DocHead } from 'meteor/kadira:dochead'
const defaultTitle = require('/package.json').name
DocHead.setTitle(defaultTitle)

const metaCharset = {charset: 'IE=edge'}
const metaIE = {'http-equiv': 'X-UA-Compatible', content: 'IE=edge'}
const metaViewport = {name: 'viewport', content: 'width=device-width, initial-scale=1'}
const metaVerification = {name: 'google-site-verification', content: 'xvox6OmYENFwswbKodJpqf1U3lIo_Z0pFSyjPtHGqoY'}

DocHead.addMeta(metaCharset)
DocHead.addMeta(metaIE)
DocHead.addMeta(metaViewport)
DocHead.addMeta(metaVerification)
