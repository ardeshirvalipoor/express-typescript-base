export const logger = (key: string, value: any = '', options: any = {}) => {
    // only works on dev
    if (global.NODE_ENV !== 'production') {
        console.log(key, value)
    }
}