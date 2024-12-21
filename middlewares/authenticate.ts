import { Router, Request, Response, NextFunction } from 'express'

// Extend the Request interface to include the user property
declare module 'express-serve-static-core' {
    interface Request {
        user?: any;
    }
}
import * as jwt from 'jsonwebtoken'

function token(secret: string) {
    return async (req: Request, res: Response, next: NextFunction) => {
        const authHeader = req.headers['authorization'] || req.headers['Authorization'] || ''
        const token = authHeader.toString().split(' ').pop()
        if (!token) {
            return res.status(401).json({
                errors: [{ msg: 'Token not found' }],
            })
        }
        try {
            req.user = jwt.verify(token, secret)
            next()
        } catch (err) {
            res.status(403).json({
                error: 'Token is not valid, or you do not have access to this area.',
            })
        }
    }
}

function optionalToken(secret: string) {
    return async (req: Request, res: Response, next: NextFunction) => {
        const authHeader = req.headers['authorization'] || req.headers['Authorization'] || ''
        const token = authHeader.toString().split(' ').pop()
        if (token) {
            try {
                req.user = jwt.verify(token, secret)
            } catch (err) {
                // Invalid token, ignore and treat as unauthenticated
            }
        }
        next()
    }
}

function authenticateJWTFromCookie(secret: string) {
    return async (req: Request, res: Response, next: NextFunction) => {
        const token = req?.cookies?.jwt
        if (token) {
            jwt.verify(token, secret, (err: any, decoded: any) => {
                if (err) {
                    return res.status(403).json({ ok: false, error: 'Invalid token' })
                }
                console.log('Going through auth middleware', decoded);

                req.user = decoded.user
                /* 
                user: {
                    id: 'EeGz48kyFNBm6pNIEBrP',
                    phone_number: '989121995001',
                    date: 1734464377,
                    contact: null,
                    last_name: 'Notifications',
                    is_bot: false,
                    first_name: 'Flep',
                    chat_id: 6679445900,
                    username: 'fleptester',
                    at: '2024-12-18T21:57:13.747Z',
                    join_token: '22'
                },
                iat: 1734559110,
                exp: 1737151110
                */
                next()
            })
        } else {
            res.status(401).json({ ok: false, error: 'No token provided' })
        }
    }
}


export default {
    token,
    optionalToken,
    authenticateJWTFromCookie,
}