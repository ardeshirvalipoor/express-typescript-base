import MongoService from "./mongo-service"
import { Db, ObjectId } from 'mongodb'
import cache from './cache-service'
import { CLIENTS } from './socket-service'
import { emitter } from "./emitter-service"



// export default {
//     all() {
//         // if user.role !== admin return 401
//     }
// }
export default class UsersService {
    static async all() {
        try {
            const db = await MongoService.find('users', {}, undefined, 0, 1000)
            return db

        } catch (err) {
            return err
        }
    }

    static async updateConversations(_id: string, conversation: string) {
        const findQuery = { _id: new ObjectId(_id) }
        const user = await MongoService.findOne('users', findQuery) // Todo: fix later
        // Todo: use $push
        if (user.conversations.map(o => o.toString()).includes(conversation)) return true // Todo later not changed in response 304
        user.conversations.push(new ObjectId(conversation))
        // delete user._id
        const updated = await MongoService.update('users', findQuery, { $set: { conversations: user.conversations } })
        cache.addUser(user)
        emitter.emit('update-users')
        return updated

    }
    static async byId(_id: string) {
        const findQuery = { _id: new ObjectId(_id) }
        // if (Db.users[_id]) return Db.users[_id]
        // const DB.users[_id] = mongo...
        // setTimeout(() => {
        //     delete Db.users[_id]
        // }, 5000);
        // On users change -> Db.users[_id] update
        return await MongoService.findOne('users', findQuery) // Todo: fix later
    }

    static async getStatus(_id: string) {
        return { status: CLIENTS.get(_id) ? 'online' : 'offline' }
    }

    static async find(query: string) {
        try {
            const db = await MongoService.aggregate('users', [{
                $search: {
                    index: 'default',
                    text: {
                        query,
                        path: ['google_profile.name', 'google_profile.email'],
                        fuzzy: {
                            maxEdits: 2,
                            prefixLength: 3
                        }
                    }
                }
            }])

            // const db = await MongoService.find('users', { $or: [{ 'profile.name': q }, { 'profile.email': q }] })
            // const db = await MongoService.find('users', { $text: { $search: q }  })

            return db

        } catch (err) {
            return err
        }
    }
    // find
}