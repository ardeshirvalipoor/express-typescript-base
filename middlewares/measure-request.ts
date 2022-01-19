// Thanks to `https://gist.github.com/sochix/831990a5f513bb74e677cc0c4958c5b8`
import { Router, Request, Response, NextFunction } from 'express'
// import usageService from '../services/usage-service'


const getDurationInMilliseconds = (start: [number, number]) => {
    const NS_PER_SEC = 1e9
    const NS_TO_MS = 1e6
    const diff = process.hrtime(start)

    return (diff[0] * NS_PER_SEC + diff[1]) / NS_TO_MS
}


export function meassure(req: Request, res: Response, next: NextFunction) {
    const start = process.hrtime()
    const ip = <string>req.headers['x-forwarded-for'] || req.socket.remoteAddress

    res.on('finish', () => {
        const durationInMilliseconds = getDurationInMilliseconds(start)
        // usageService.logUsage({
        //     at: new Date,
        //     durationInMilliseconds,
        //     ip,
        //     method: req.method,
        //     originalUrl: req.originalUrl,
        //     statusCode: res.statusCode
        // })
    })

    res.on('close', () => {
        const durationInMilliseconds = getDurationInMilliseconds(start)
        // console.log(`${req.method} ${req.originalUrl} ${res.statusCode} [CLOSED] ${durationInMilliseconds.toLocaleString()} ms`)
        // usageService.logUsage({
        //     at: new Date,
        //     durationInMilliseconds,
        //     ip,
        //     method: req.method,
        //     originalUrl: req.originalUrl,
        //     statusCode: res.statusCode
        // })
    })

    next()
}