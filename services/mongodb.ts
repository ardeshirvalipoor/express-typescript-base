import { Db, MongoClient, MongoClientOptions } from 'mongodb'

interface IFindOptions {
    limit?: number
    skip?: number
    sort?: any
    projection?: any
}

export default (dbUri: string, dbName: string) => {

    const options: MongoClientOptions = {}
    const client = new MongoClient(dbUri, options)
    let db: Db
    async function reconnect(retries = 5, interval = 2000) {
        if (db) {
            console.log('Already connected')
            return
        }

        if (retries < 1) {
            console.error('Failed to reconnect after all attempts')
            return
        }

        console.log('Attempting to reconnect...', retries)

        try {
            await client.connect()
            db = client.db(dbName)
            console.log('Reconnected successfully')
        } catch (err) {
            console.error('Reconnect attempt failed, retrying...', err)
            setTimeout(() => reconnect(retries - 1, interval), interval)
        }
    }

    client.on('close', () => {
        console.log('MongoDB connection closed')
        reconnect()
    })

    client.on('reconnect', () => {
        console.log('MongoDB reconnected')
    })

    client.on('error', (err) => {
        console.error('MongoDB connection error:', err)
        reconnect()
    })


    async function search(collectionName: string, indexName: string, query: any, sort = {}, skip = 0, limit = 25) {
        if (!db) {
            await reconnect()
        }
        const q = [
            {
                '$search': {
                    'index': indexName,
                    'text': {
                        'query': `{ $text: { $search: ${query} } }`,
                        'path': {
                            'wildcard': '*'
                        }
                    }
                }
            },
            {
                $limit: limit
            },
            {
                $project: {
                    "_id": 0,
                }
            }
        ]
        return db.collection(collectionName).aggregate(q).toArray()
    }

    async function count(collectionName: string, query: any = {}) {
        if (!db) {
            await reconnect()
        }
        return db.collection(collectionName).countDocuments(query)
    }

    async function find(collectionName: string, query?: any, options: IFindOptions = {}) { // Todo: fix later
        const { limit, skip, sort, projection } = { projection: {}, sort: {}, skip: 0, limit: 25, ...options }
        if (!db) {
            await reconnect()
        }
        // for (const key in query) {
        //     if (key.endsWith('_id') && typeof query[key] === 'string') {
        //         query[key] = new ObjectId(query[key])
        //     }
        // }
        return db.collection(collectionName).find(query).project(projection).sort(sort).skip(+skip).limit(+limit).toArray()
    }

    async function findOne(collectionName: string, query?: any, options: IFindOptions = {}) {
        const { projection } = { projection: {}, ...options }
        if (!db) {
            await reconnect()
        }
        return db.collection(collectionName).findOne(query)//.project(projection)
    }

    async function aggregate<T>(collectionName: string, query: any[]) {
        try {
            if (!db) {
                await reconnect()
            }
            let collection = db.collection(collectionName)
            const docs = await collection.aggregate(query).toArray()
            return docs
        } catch (error) {
            console.log('Code 2: ', error)
            throw error
        }
    }

    async function save<T>(collectionName: string, item: any) {
        try {
            if (!db) {
                await reconnect()
            }
            let collection = db.collection(collectionName)
            const docs = await collection.insertOne(item) // or at here?
            return { ...item, _id: docs?.insertedId }
        } catch (error) {
            console.log('Code 3: ', error)
            throw error
        }
    }

    async function saveMany<T>(collectionName: string, items: any) {
        try {
            if (!db) {
                await reconnect()
            }

            let collection = db.collection(collectionName)
            const docs = await collection.insertMany(items)
            return { results: 'inserted' }
        } catch (error) {
            console.log('Code 3: ', error)
            throw error
        }
    }

    async function update<T>(collectionName: string, query: any, item: any, options = {}) { // Todod change it to find
        try {
            if (!db) {
                await reconnect()
            }
            let collection = db.collection(collectionName)
            const docs = await collection.findOneAndUpdate(query, item, options)
            return docs
        } catch (error) {
            console.log('Code 3: ', error)
            throw error
        }
    }

    async function replace<T>(collectionName: string, query: any, item: any, options = {}) { // Todod change it to find
        try {
            if (!db) {
                await reconnect()
            }
            let collection = db.collection(collectionName)
            const docs = await collection.replaceOne(query, item, options)
            return docs
        } catch (error) {
            console.log('Code 3: ', error)
            throw error
        }
    }

    async function updateMany<T>(collectionName: string, query: any, item: any, options = {}) { // Todod change it to find
        try {
            if (!db) {
                await reconnect()
            }
            let collection = db.collection(collectionName)
            const docs = await collection.updateMany(query, /* { $set: { ...item } */ item, options)
            return docs
        } catch (error) {
            console.log('Code 3: ', error)
            throw error
        }
    }

    async function deleteOne<T>(collectionName: string, query: any, options = {}) { // Todod change it to find
        try {
            if (!db) {
                await reconnect()
            }
            let collection = db.collection(collectionName)
            const docs = await collection.deleteOne(query, options)
            return docs
        } catch (error) {
            console.log('Code delete: ', error)
            throw error
        }
    }

    async function deleteMany<T>(collectionName: string, query: any, options = {}) { // Todod change it to find
        try {
            if (!db) {
                await reconnect()
            }
            let collection = db.collection(collectionName)
            const docs = await collection.deleteMany(query, options)
            return docs
        } catch (error) {
            console.log('Code delete many: ', error)
            throw error
        }
    }

    return {
        search,
        count,
        find,
        findOne,
        aggregate,
        save,
        saveMany,
        update,
        updateMany,
        replace,
        deleteOne,
        deleteMany,
    }
}