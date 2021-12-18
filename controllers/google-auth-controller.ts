import * as jwt from 'jsonwebtoken'
import { Router, Request, Response, NextFunction } from 'express'
import { SECRET, GOOGLE_REDIRECT_URL } from '../../configs/configs'
import { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_SCOPE, JWT_SECRET } from '../../configs/configs'
import * as path from 'path'
import MongoService from '../services/mongo-service'
import cache from '../services/cache-service'
import conversationsService from '../../services/conversations-service'
import { globalEmitter } from '../services/emitter-service'
import { shortUUID } from '../utils/short-uuid'
import UsersService from '../services/users-service'
const { google } = require('googleapis')


// should be event based

export const auth = async (req: Request, res: Response, next: NextFunction) => {
    const prefix = req.protocol + '://' + req.hostname + (req.hostname == 'localhost' ? ':3000' : '')
    const oauth2Client = new google.auth.OAuth2(
        GOOGLE_CLIENT_ID,
        GOOGLE_CLIENT_SECRET,
        prefix + GOOGLE_REDIRECT_URL
    )
    const url = oauth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: GOOGLE_SCOPE
    })
    res.end(url)
}

export const redirect = async (req, res) => {
    res.sendFile(path.join(__dirname + '/../public/app/auth.html'))
}

export const callback = async (req, res) => {
    const code = req.query['code']
    const prefix = req.protocol + '://' + req.hostname + (req.hostname == 'localhost' ? ':3000' : '')

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
        (err, response) => {
            if (err) {
                console.log(err)
                res.status(500).json({ error: err, data: null })
            } else {
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

                const results: any = { google_profile: response.data }
                MongoService.findOne('users', { 'google_profile.email': results.google_profile.email }).then(async possibleUser => {
                    if (possibleUser) {
                        // Todo: record usage
                        results._id = possibleUser._id
                        results.conversations = possibleUser?.conversations || []
                    } else {
                        const saved = await MongoService.save('users', { 'google_profile': results.google_profile, conversations: [], at: new Date() })
                        // Todo: create conversation Me locked
                        const channel = await conversationsService.create({
                            members: 1,
                            type: 'channel',
                            owner: saved._id,
                            name: 'My flashcards',
                            channel_id: 'me_' + shortUUID(),
                            access: 'private',
                        })

                        results._id = saved._id
                        await UsersService.updateConversations(saved._id.toString(), channel._id.toString())
                        
                        cache.addUser(results)
                        appEmitter.emit('update-users')
                    }
                    var token = jwt.sign({ _id: results._id, email: response.data.email }, JWT_SECRET) // Todo: Handle auto logout
                    res.json({ ok: true, data: { ...results, token } })
                }).catch(error => {
                    console.log('E4', error)
                    res.status(500).json({ error, data: null })
                })
            }
        }
    )
}

export const roleAuthorization = (roles) => {

    return (req, res, next) => {

        var user = req.user

        /*         dummyUser.findById(user._id, (err, foundUser) => {
        
                    if (err) {
                        res.status(422).json({ error: 'No user found.' });
                        return next(err);
                    }
        
                    if (roles.indexOf(foundUser.role) > -1) {
                        return next();
                    }
        
                    res.status(401).json({ error: 'You are not authorized to view this content' });
                    return next('Unauthorized');
        
                }); */

    }

}