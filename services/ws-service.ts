import WebSocket = require('ws')
import { Request } from 'express'
import { emitter } from './emitter-service'
export let CLIENTS = new Map()

export function handleWSS(wss) {
    wss.on('connection', handleWsConnection)
    wss.on('error', (err) => console.log('wss faced an error', err))
    wss.on('close', (err) => console.log('wss closed', err))
    wss.on('listening', () => console.log('wss listening'))
}

export async function handleWsConnection(ws: WebSocket, req: Request) {
    console.log('---- handleWSConnection ----');
    
    ws.on('open', data => console.log('onpoen', data))
    ws.on('upgrade', data => console.log('upgrade', data))
    // ws.on('message', handleMessage(ws))
    ws.on('message', (data) => emitter.emit('ws-message', ws, data) )
    ws.on('close', handleClose(ws))
}

function handleClose(ws: WebSocket) {
    return async function () {
        CLIENTS.delete(ws['email']);
        CLIENTS.forEach(client => {
            client.send?.(JSON.stringify({ type: 'status', _id: ws['email'], status: 'offline' }))
        })
    }
}

export async function verifyClient(info, done) {
    // done(false, 401, 'Unauthorized')
    done(true)
}
