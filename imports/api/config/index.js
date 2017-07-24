const ENV = Meteor.settings && Meteor.settings.public ? Meteor.settings.public.env : null

let config
if (ENV == 'stage') {
    config = require('./config-stage')
} else if (ENV == 'production') {
    config = require('./config-production')
} else {
    config = require('./config')
}

module.exports = config

