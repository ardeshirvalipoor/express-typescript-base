import * as express from 'express'
import * as cors from 'cors'
import router from './routes/index'
import { json, urlencoded } from 'express'
import { Server, OPEN } from 'ws'
import { handleWsConnection, verifyClient } from './services/socket-service'

export const app = express()
const PORT = process.env.PORT || global.PORT
app.enable('trust proxy')
app.use(cors())
app.use(urlencoded({ extended: true }))
app.use(json({ limit: 1024102420, type: 'application/json' }))
app.use(router)
const server = app.listen(PORT, () => console.log('Listening on port', PORT))
export const wss = new Server({ server, verifyClient, path: '/socket' || global.config.socketPath })
wss.on('connection', handleWsConnection)
wss.on('error', (err) => {
    console.log('wss faced an error', err)
})
wss.on('close', (err) => {
    console.log('wss closed', err)
})
wss.on('listening', () => {
    console.log('wss listening')
})






