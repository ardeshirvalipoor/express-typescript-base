import { Db, MongoClient, MongoClientOptions, ObjectID } from 'mongodb'
import { MONGODB_URI, DB_NAME } from '../../configs/configs'

let db: Db
const options: MongoClientOptions = {
    useUnifiedTopology: true,
    useNewUrlParser: true,
}
const client = new MongoClient(MONGODB_URI, options)
async function getDB(retries = 10): Promise<Db> {
    return new Promise((resolve, reject) => {
        // if (db) db.stats().then(info=>console.log({info}))
        if (db) return resolve(db)
        client.connect().then(connection => {
            db = connection.db(DB_NAME)
            return resolve(db)

        }).catch(async err => {
            console.log('No', retries);
            if (retries < 1) {
                console.log('Mongo conenct error', err)
                return reject(err)
            }
            return await getDB(--retries)
        })
    })
}

export default {

    async find(collectionName: string, query?: any, sort?: any, skip = 0, limit = 25) { // Todo: fix later
        const db = await getDB()
        return db.collection(collectionName).find(query).sort(sort).skip(+skip).limit(+limit).toArray()
    },
    async findOne(collectionName: string, query?: any) {
        const db = await getDB()
        return db.collection(collectionName).findOne(query)
    },
    async aggregate<T>(collectionName: string, query?: any, sort?: any) {
        return new Promise<T[]>(async (resolve, reject) => {
            try {
                const db = await getDB()
                let collection = db.collection(collectionName)
                const docs = await collection.aggregate(query).limit(50).toArray()

                return resolve(docs)
            } catch (error) {
                console.log('Code 2: ', error)
                return reject(error)
            }
        })
    },
    async save<T>(collectionName: string, item: any) {
        return new Promise<any>(async (resolve, reject) => {
            try {
                const db = await getDB()

                let collection = db.collection(collectionName)
                const docs = await collection.insertOne(item) // or at here?
                // docs: {
                //     acknowledged: true,
                //         insertedId: new ObjectId("60ef5f573e014e54bf7b19f1")
                // }
                return resolve({ ...item, _id: docs?.insertedId }) //Todo: change to _id
            } catch (error) {
                console.log('Code 3: ', error)
                return reject(error)
            }
        })
    },
    async saveMany<T>(collectionName: string, items: any) {
        return new Promise<any>(async (resolve, reject) => {
            try {
                const db = await getDB()

                let collection = db.collection(collectionName)
                const docs = await collection.insertMany(items)
                return resolve({ results: 'inserted' })
            } catch (error) {
                console.log('Code 3: ', error)
                return reject(error)
            }
        })
    },
    async update<T>(collectionName: string, query: any, item: any, options = {}) { // Todod change it to find
        return new Promise<any>(async (resolve, reject) => {
            try {
                const db = await getDB()

                let collection = db.collection(collectionName)
                const docs = await collection.findOneAndUpdate(query, /* { $set: { ...item } */ item, options)
                return resolve(docs) //Todo: change to _id
            } catch (error) {
                console.log('Code 3: ', error)
                return reject(error)
            }
        })
    }
}



