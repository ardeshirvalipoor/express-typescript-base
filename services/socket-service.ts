import { IncomingMessage } from 'http'
import WebSocket = require('ws')
import { JWT_SECRET } from '../../configs/configs'
import * as jwt from 'jsonwebtoken'
import conversationsService from '../../services/conversations-service'
import messagesService from '../../services/messages-service'
import UsersService from './users-service'
import { globalEmitter } from './emitter-service'
export let CLIENTS = new Map()

export async function verifyClient(info, done) {
    // done(false, 401, 'Unauthorized')
    done(true)
}

let ALL_USERS = []
globalEmitter.on('update-users', async () => {
    ALL_USERS = await UsersService.all()

})
export async function handleWsConnection(ws: WebSocket, req: IncomingMessage) {
    ALL_USERS = await UsersService.all()
    ws.on('open', data => console.log('onpoen', data))
    ws.on('upgrade', data => console.log('upgrade', data))
    ws.on('message', handleMessage(ws))
    ws.on('close', handleClose(ws))
}

function handleClose(ws: WebSocket) {
    return async function () {
        CLIENTS.delete(ws['_id']);
        CLIENTS.forEach(client => {
            client.send?.(JSON.stringify({ type: 'status', _id: ws['_id'], status: 'offline' }))
        })
    }
}

function handleMessage(ws: WebSocket) {

    return async function (data: WebSocket.Data) {
        const parsedMessage = { ...JSON.parse(data.toString()), at: new Date() }

        if (parsedMessage.type == 'authenticate') {
            console.log('\nIn authenticate');
            
            // if (!parsedMessage.payload?.token) return
            jwt.verify(parsedMessage.payload?.token, JWT_SECRET as string, (err: any, decoded: any) => {
                if (err) {
                    ws.close()
                    return
                }
                console.log({decoded});
                
                CLIENTS.set(decoded._id, ws);
                ws['_id'] = decoded._id
                CLIENTS.forEach(client => {
                    client?.send?.(JSON.stringify({ type: 'status', _id: ws['_id'], status: 'online' }))
                })
            })
        }
        if (parsedMessage.type == 'user-logged-out') {
            CLIENTS.delete(ws['_id']);
            CLIENTS.forEach(client => {
                client?.send?.(JSON.stringify({ type: 'status', _id: ws['_id'], status: 'offline' }))
            })
        }
        // Todo: check this
        if (parsedMessage.type == 'user-logged-in') {
            CLIENTS.forEach(client => {
                client?.send?.(JSON.stringify({ type: 'status', _id: ws['_id'], status: 'online' }))
            })
        }
        if (parsedMessage.type == 'direct' || parsedMessage.type == 'post') {
            const auto_save = parsedMessage.auto_save
             if (!ws['_id']) {
                 ws.close()  // or.. !CLIENTS.get(ws['_id'])
                 return
             }
             
            const messageSaved = await messagesService.saveReceivedSocket(parsedMessage)
            const targets = ALL_USERS.filter(u => u.conversations.map(o => o.toString()).includes(messageSaved.conversation_id.toString()))
            
            targets.forEach(target => {
                CLIENTS.get(target._id.toString())?.send?.(JSON.stringify({...messageSaved, auto_save}))
            })
            
            // Todo: handle multiple devices, one _id two devices
            conversationsService.updateConversationLastMessage(messageSaved)
        }
        if (parsedMessage.type == 'conversations-updated') {
            ALL_USERS = await UsersService.all()
            const targets = ALL_USERS.filter(u => u.conversations.map(o => o.toString()).includes(parsedMessage._id.toString()))
            targets.forEach(target => {
                CLIENTS.get(target._id.toString())?.send?.(JSON.stringify(parsedMessage))
            })
            // Todo: handle multiple devices, one _id two devices
        }
        if (parsedMessage.type == 'message-deleted') {
            await messagesService.updateReceivedDeleteSocket(parsedMessage)
            const targets = ALL_USERS.filter(u => u.conversations.map(o => o?.toString())?.includes(parsedMessage.conversation_id.toString()))
            targets.forEach(target => CLIENTS.get(target._id.toString())?.send?.(JSON.stringify(parsedMessage)))
        }
        if (parsedMessage.type == 'message-edited') {
            
            const updated = await messagesService.updateReceivedSocket(parsedMessage)
            
            const targets = ALL_USERS.filter(u => u.conversations.map(o => o?.toString())?.includes(parsedMessage.conversation_id.toString()))
            targets.forEach(target => CLIENTS.get(target._id.toString())?.send?.(JSON.stringify(parsedMessage)))
        }
    }
}