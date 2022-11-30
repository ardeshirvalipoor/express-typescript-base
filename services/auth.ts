
import { google } from 'googleapis'

function getGoogleUrl(clientId: string, clientSecret: string, redirectUrl: string, scope: string[]) {
    const oauth2Client = new google.auth.OAuth2(clientId, clientSecret, redirectUrl)
    const url = oauth2Client.generateAuthUrl({ access_type: 'offline', scope })
    return url
}

async function getGoogleCallback(clientId: string, clientSecret: string, redirectUrl: string, code: string) {
    try {
        const oauth2Client = new google.auth.OAuth2(clientId, clientSecret, redirectUrl)
        const { tokens } = await oauth2Client.getToken(code)
        oauth2Client.setCredentials(tokens)
        var oauth2 = google.oauth2({ auth: oauth2Client, version: 'v2' })
        const { data } = await oauth2.userinfo.get()
        return data
    } catch (error) {
        throw new Error(error)
    }
}

export default {
    getGoogleUrl,
    getGoogleCallback
}