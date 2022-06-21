import { IGoogleProfile } from '../interfaces/auth'

const { google } = require('googleapis')



const getGoogleUrl = (id: string, secret: string, burl: string, scope: string[]) => { // auth
    const oauth2Client = new google.auth.OAuth2(
        id,
        secret,
        burl
    )
    const url = oauth2Client.generateAuthUrl({
        access_type: 'offline',
        scope
    })
    return url
}

// export const getRedirectUrl = async (req, res) => { // Should be moved to the controller
//     res.sendFile(path.join(__dirname + '/../public/app/auth.html'))
// }

const getGoogleCallback = (id: string, secret: string, burl: string, code: string) => {
    return new Promise(async (resolve, reject) => {
        const oauth2Client = new google.auth.OAuth2(
            id,
            secret,
            burl,
            code
        )
        const { tokens } = await oauth2Client.getToken(code)
        oauth2Client.setCredentials(tokens)
        var oauth2 = google.oauth2({
            auth: oauth2Client,
            version: 'v2'
        })
        try {
            const { data } = await oauth2.userinfo.get()
            resolve(data)
        } catch (error) {
            reject(error)
        }
    })
}

// export const roleAuthorization = (roles) => {
//     return (req, res, next) => {
//         var user = req.user
//         /*         dummyUser.findById(user._id, (err, foundUser) => {
//                     if (err) {
//                         res.status(422).json({ error: 'No user found.' });
//                         return next(err);
//                     }
//                     if (roles.indexOf(foundUser.role) > -1) {
//                         return next();
//                     }
//                     res.status(401).json({ error: 'You are not authorized to view this content' });
//                     return next('Unauthorized');
//                 }); */
//     }
// }

export default {
    getGoogleUrl,
    getGoogleCallback
}