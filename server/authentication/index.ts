import { Application, RequestHandler } from 'express'
import * as passport from 'passport'
import { Strategy, ExtractJwt, StrategyOptions } from 'passport-jwt'
import * as jwt from 'jsonwebtoken'
import * as Types from '../types'
import { db } from '../data'

type JwtPayload = {
  id: string
}

const jwtOptions : StrategyOptions = {
  secretOrKey: process.env.SECRET || 'super-secret-secret',
  jwtFromRequest: ExtractJwt.fromAuthHeaderWithScheme('jwt')
}

const strategy = new Strategy(jwtOptions, (payload : JwtPayload | undefined, done) =>
  (payload == null)
    ? done('No payload received', undefined)
    : db.users.findById(payload.id)
      .then(user => done(false, user))
      .catch(reason => done(reason, undefined))
)

passport.use(strategy)

type Token = string

type SafeUser = {
  email : string,
  name : Types.Name,
  token: Token
}

const getUserWithToken = (email : string, password : string) : Promise<SafeUser> =>
  db.users.findWithLogin(email, password)
    .then(user =>
      (user)
        ? Promise.resolve({
            email: user.email,
            name: user.name,
            role: user.role,
            token: jwt.sign({ id: user.id }, jwtOptions.secretOrKey)
          })
        : Promise.reject('Sorry, could not find that user.')
    )

export type Authentication = {
  middleware : RequestHandler
  signIn : RequestHandler
}

export const setupAuthentication = (app: Application) : Authentication => {
  app.use(passport.initialize())

  return {

    middleware: passport.authenticate('jwt', { session: false }),

    signIn: (req, res) => {
      const body = req.body || {}
      const email : string | undefined = body.email || undefined
      const password : string | undefined = body.password || undefined

      if (email === undefined || password === undefined ) {
        res.json({
          error: true,
          message: 'Please provide an email and password.',
          data: []
        })
      } else {
        getUserWithToken(email, password)
          .then(userWithToken => res.json({
            error: false,
            message: 'Login successful!',
            data: [ userWithToken ]
          }))
          .catch(reason => res.json({
            error: true,
            message: reason,
            data: []
          }))
      }
    }
  }
} 

