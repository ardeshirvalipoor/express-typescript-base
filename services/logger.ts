const log = (key: string, value: any = '', options: any = {}) => {
    if (process.env.NODE_ENV !== 'development') {
        return
    }
    console.log(key, value)
}

export default {
    log
}