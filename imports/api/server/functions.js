import config from '../config'

/**
 * Get google auth token
 * @param scope - Array of google scopes
 * @param callback
 */
export const googleServerApiAutToken = (scope, callback) => {
    const TokenCache = require('google-oauth-jwt').TokenCache,
        tokens = new TokenCache()
    
    tokens.get({
        // use the email address of the service account, as seen in the API console
        email: config.google.serviceAccountEmail,
        // use the PEM file we generated from the downloaded key
        keyFile: config.google.serviceAccountPemCertPath,
        // specify the scopes you wish to access
        scopes: scope
    }, (err, token) => {
        callback(null, token)
    })
}
