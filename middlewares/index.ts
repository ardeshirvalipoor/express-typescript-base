import authenticate from './authenticate'
import authorize from './authorize'
import errors from '../../middlewares.ts/errors'

export default {
    authorize: authorize,
    authenticate: authenticate,
}