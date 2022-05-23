import * as jwt from 'jsonwebtoken'

export function authorize(ADMINS = [] as string[]) {
    return (req, res, next) => {
        const authHeader = req.headers['authorization']
        const token = authHeader && authHeader.split(' ')[1]
        if (token == null) return res.sendStatus(401)
        const decode: any = jwt.decode(token)

        if (!ADMINS.includes(decode.email)) {
            return res.sendStatus(403)

        }
        next()
    }
}