import { Router, Request, Response, NextFunction } from 'express'
import * as fs from 'fs'
import { logger } from '../services/logger-service'
logger('hic----', global.MONGODB_URI)
export const getPosts = async (req: Request, res: Response, next: NextFunction) => {

    try {
        res.json({ status: 'ok', message: 'Thank you for using emerald' })
    } catch (error) {
        console.log(error)
        res.json({ status: 'error', error })
    }
}
