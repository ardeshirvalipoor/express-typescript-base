import { WebSocket, WebSocketServer } from 'ws'
import { Request } from 'express'
import { emitter } from './emitter'
import { wsAuthMiddleware } from '../middlewares/ws'
import { Server } from 'http'

export const CLIENTS = new Map<string, WebSocket>()

export function handleWSS(server: Server, configs: any) {

    const wss = new WebSocketServer({ noServer: true })
    wss.on('connection', function connection(ws: WebSocket, req: Request) {
        handleWsConnection(ws, req)
    })
    server.on('upgrade', function upgrade(req: Request, socket, head) {
        socket.on('error', console.error)
        wsAuthMiddleware(req, null, function next(err: any) {
            if (err) {
                console.log('sending unauth', err)
                socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n')
                socket.destroy()
                return
            }
            socket.removeListener('error', console.error)
            wss.handleUpgrade(req, socket, head, function done(ws) {
                wss.emit('connection', ws, req)
            })
        }, configs)
    })
    wss.on('error', console.error)
}

function handleWsConnection(ws: WebSocket, req: Request) {
    const userId = req.userId
    if (userId) CLIENTS.set(userId, ws)
    ws.on('message', (data) => {
        emitter.emit('ws-message', ws, data)
    })
    ws.on('close', () => {
        if (userId) {
            notifyClientsOfStatus(userId, 'offline')
            CLIENTS.delete(userId)
        }
    })
    ws.on('error', console.error)
    ws.send(JSON.stringify({ message: 'Hello from server!' }))
}

function notifyClientsOfStatus(userId: string, status: string) {
    CLIENTS.get(userId).send(JSON.stringify({ type: 'status', _id: userId, status }))
}