import Hi from '../routes/hi-route'
import AuthRoutes from '../routes/google-auth-route'
import { Router } from 'express'
import { logger } from '../services/logger-service'
logger('info2', global.MONGODB_URI)
const router = Router({strict: true})

router.get('/', (req, res) => res.end('Home!!!'))
router.get('/favicon.ico', (req, res) => res.end())
router.use('/auth', AuthRoutes)
router.use('/api/hi', Hi)

export default router
