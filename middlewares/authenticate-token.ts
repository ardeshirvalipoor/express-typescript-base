import { Router, Request, Response, NextFunction } from 'express'
import * as jwt from 'jsonwebtoken'

export function authenticateToken(JWT_SECRET) {
    return async (req: Request, res: Response, next: NextFunction) => {
        const authHeader = req.headers['authorization']
        const token = authHeader && authHeader.split(' ')[1]
        if (!token) {
            return res.status(401).json({
                errors: [
                    {
                        msg: 'Token not found',
                    },
                ],
            })
        }

        try {
            const user: any = jwt.verify(token, JWT_SECRET)
            req['user'] = { email: user.email } as any
            next()
        } catch (err) {
            res.status(403).json({
                errors: [
                    {
                        msg: 'Token is not valid',
                    },
                ],
            })
        }
    }
}