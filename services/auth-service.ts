import * as jwt from 'jsonwebtoken'
import { Router, Request, Response, NextFunction } from 'express'
import * as path from 'path'
import MongoService from '../services/mongo-service'
import cache from '../services/cache-service'
import { emitter } from '../services/emitter-service'
import { shortUUID } from '../utils/short-uuid'
const { google } = require('googleapis')



export const getUrl = async (host: string, protocol: string, googleCredentials: any) => { // auth
    
    const { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REDIRECT_URL, GOOGLE_SCOPE } = googleCredentials
    const prefix = protocol + '://' + host
    const oauth2Client = new google.auth.OAuth2(
        GOOGLE_CLIENT_ID,
        GOOGLE_CLIENT_SECRET,
        prefix + GOOGLE_REDIRECT_URL
    )
    const url = oauth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: GOOGLE_SCOPE
    })
    return url
}

// export const getRedirectUrl = async (req, res) => { // Should be moved to the controller
//     res.sendFile(path.join(__dirname + '/../public/app/auth.html'))
// }

export const getCallback = (hostname: string, protocol: string, googleCredentials: any, code: string) => {
    return new Promise(async (resolve, reject) => {
        const { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REDIRECT_URL, GOOGLE_SCOPE } = googleCredentials
        const prefix = protocol + '://' + hostname + (hostname == 'localhost' ? ':3000' : '')
        const oauth2Client = new google.auth.OAuth2(
            GOOGLE_CLIENT_ID,
            GOOGLE_CLIENT_SECRET,
            prefix + GOOGLE_REDIRECT_URL
        )
        const { tokens } = await oauth2Client.getToken(code)
        oauth2Client.setCredentials(tokens)
        var oauth2 = google.oauth2({
            auth: oauth2Client,
            version: 'v2'
        })
        oauth2.userinfo.get(
            (err: any, response: any) => {
                if (err) {
                    console.log(err)
                    return reject(err)
                } else {
                    return resolve(response.data)
                    // response.data
                    // {
                    //     id: string
                    //     email: string
                    //     verified_email: true,
                    //     name: string
                    //     given_name: strin
                    //     family_name: strin
                    //     picture: string
                    //     locale: 'string
                }
            }
        )
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