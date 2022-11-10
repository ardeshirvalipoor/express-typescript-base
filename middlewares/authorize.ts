import { Router, Request, Response, NextFunction } from 'express'
import * as jwt from 'jsonwebtoken'

function byRole(ADMINS = [] as string[]) {
    return (req: Request, res: Response, next: NextFunction) => {
        const authHeader = req.headers['authorization']
        const token = authHeader && authHeader.split(' ')[1]
        if (token == null) return res.sendStatus(401)
        const decode: any = jwt.decode(token)

        if (!ADMINS.includes(decode.email)) {
            return res.sendStatus(403)

        }
        next()
    }
}

export default {
    byRole
}