// services/ws/authMiddleware.ts
import { Router, Request, Response, NextFunction } from 'express'
import * as jwt from 'jsonwebtoken'

export function wsAuthMiddleware(req: Request, res: Response, next: NextFunction, configs: any) {
    const token = new URL(req.url, `http://${req.headers.host}`).searchParams.get('token')
    if (!token) {
        res.writeHead(401, { 'Content-Type': 'text/plain' })
        res.end('Unauthorized')
        return
    }
    try {
        const decoded: any = jwt.verify(token, configs.jwt.SECRET) // Replace with your actual secret key
        req.user = decoded.user // todo: fix it
        req.email = decoded.email
        next()
    } catch (error) {
        res.writeHead(401, { 'Content-Type': 'text/plain' })
        res.end('Unauthorized')
    }
}
