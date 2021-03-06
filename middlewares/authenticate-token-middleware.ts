import * as jwt from 'jsonwebtoken'

export function authenticateToken(JWT_SECRET) {
    return (req, res, next) => {
        const authHeader = req.headers['authorization']
        const token = authHeader && authHeader.split(' ')[1]
        if (token == null) return res.sendStatus(401)

        jwt.verify(token, JWT_SECRET as string, (err: any, user: any) => {
            if (err) return res.sendStatus(401)
            req.user = { email: user.email }
            next()
        })
    }
}