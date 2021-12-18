import { Router, Request, Response, NextFunction } from 'express'
import * as AuthController from '../controllers/google-auth-controller'

let router = Router()

router.get('/google', AuthController.auth) // get the window
router.get('/google/redirect', AuthController.redirect) // after login succeed
router.get('/google/callback', AuthController.callback) // get data

export default router