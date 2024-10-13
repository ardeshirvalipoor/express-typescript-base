import { Router, Request, Response, NextFunction } from 'express'
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
            req['user'] = <any>jwt.verify(token, secret)
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
                req['user'] = <any>jwt.verify(token, secret)
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
                req['user'] = decoded
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