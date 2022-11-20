import { Router, Request, Response, NextFunction } from 'express'
import * as jwt from 'jsonwebtoken'

function token(secret: string) {
    return async (req: Request, res: Response, next: NextFunction) => {
        const authHeader = req.headers['authorization']
        const token = authHeader && authHeader.split(' ')[1]
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
                errors: [{ msg: 'Token is not valid, or you do not have access to this area.' }],
            })
        }
    }
}

export default {
    token,
}