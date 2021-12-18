// import * as passport from 'passport'

// export const requireAuth  = passport.authenticate('jwt', { session: false })
// export const requireLogin = passport.authenticate('local', { session: false })

// import { OAuth2Strategy as GoogleStrategy } from 'passport-google-oauth'
// import { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REDIRECT_URL } from './configs'

// export default (passport) => {

//     passport.serializeUser((user, done) => {
//         done(null, user)
//     })

//     passport.deserializeUser((user, done) => {
//         done(null, user)
//     })

//     passport.use(new GoogleStrategy({
//         clientID: GOOGLE_CLIENT_ID,
//         clientSecret: GOOGLE_CLIENT_SECRET,
//         callbackURL: GOOGLE_REDIRECT_URL
//     },
//         (accessToken, refreshToken, profile, cb) => {
//             console.log(JSON.stringify({
//                 accessToken,
//                 refreshToken,
//                 profile
//             }));
//             return cb(null, {
//                 accessToken,
//                 refreshToken,
//                 profile
//             })
//         }))
// }