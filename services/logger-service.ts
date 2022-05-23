export const logger = (key: string, value: any = '', options: any = {}) => {
    // only works on dev
    if (process.env.NODE_ENV !== 'development') {
        return;
    }
    console.log(key, value)

}