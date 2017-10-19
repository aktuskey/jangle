import { Application, RequestHandler, Request, Response } from 'express'
import * as passport from 'passport'
import { Strategy, ExtractJwt, StrategyOptions } from 'passport-jwt'
import * as jwt from 'jsonwebtoken'
import * as Types from '../types'
import { db } from '../data'
import { UserModel } from '../models/User'

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

type UserFunction = (email: string, password: string) =>
  Promise<SafeUser>

const parseToSafeUser = (user : UserModel) =>
  (user)
    ? Promise.resolve({
        email: user.email,
        name: user.name,
        role: user.role,
        token: jwt.sign({ id: user.id }, jwtOptions.secretOrKey)
      })
    : Promise.reject('Sorry, could not find that user.')


const createUserWithToken = (name: Types.Name) => (email: string, password: string) : Promise<SafeUser> =>
  db.users.createFirstUser(email, password, name)
    .then(parseToSafeUser)

const getUserWithToken = (email : string, password : string) : Promise<SafeUser> =>
  db.users.findWithLogin(email, password)
    .then(parseToSafeUser)

const authHelper = (fn: UserFunction) => (req: Request, res: Response) => {
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
    fn(email, password)
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

const signUp = (name: Types.Name) => authHelper(createUserWithToken(name))
const signIn = authHelper(getUserWithToken)


export type Authentication = {
  middleware : RequestHandler
  signInOrUpIdkYet : RequestHandler
}

export const setupAuthentication = (app: Application) : Authentication => {
  app.use(passport.initialize())

  return {

    middleware: passport.authenticate('jwt', { session: false }),

    signInOrUpIdkYet: (req: Request, res: Response) =>
      hasUsers().then(hasUsers => hasUsers
        ? signIn(req, res)
        : signUp(req.body.name
            ? { first: req.body.name.first || 'Admin', last: req.body.name.last || 'User' }
            : { first: 'Admin', last: 'User' }
          )(req, res)
      )
  }
} 

export const hasUsers = () : Promise<boolean> =>
  db.users.hasUsers()
