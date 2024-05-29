import { Request, Response, NextFunction } from 'express';

export function forceHTTPS() {
    return (req: Request, res: Response, next: NextFunction) => {
        if (process.env.NODE_ENV !== 'production') return next()
        if (req.secure) return next();
        return res.redirect(301, ['https://', req.get('Host'), req.url].join(''))
    }
}