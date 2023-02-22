export function convertToMongoStyle(query) {
    Object.keys(query).forEach(key => {
        if (typeof query[key] === 'object') {
            convertToMongoStyle(query[key])
        }
        if (['gte', 'lte', 'gt', 'lt', 'in', 'nin', 'ne'].includes(key)) {
            const newKey = '$' + key
            query[newKey] = query[key]
            delete query[key]
        }
    })
    return query
}