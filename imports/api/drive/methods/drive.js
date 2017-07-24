import google from 'googleapis'
import { prossDocDrive } from '../../config'

const { clientId, clientSecret, redirectUri, refreshToken } = prossDocDrive
const OAuth2Client = google.auth.OAuth2
const oauth2Client = new OAuth2Client(clientId, clientSecret, redirectUri)
oauth2Client.setCredentials({
  refresh_token: refreshToken,
})
const drive = google.drive({ version: 'v3', auth: oauth2Client })
export { drive, oauth2Client }
