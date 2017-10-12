import { Application, RequestHandler } from 'express'
import * as passport from 'passport'
import { Strategy, ExtractJwt, StrategyOptions } from 'passport-jwt'
import * as jwt from 'jsonwebtoken'
import { debug } from '../utils'

type Id = number

type JwtPayload = {
  id: Id
}

type User = {
  id: Id
  role: string
  email: string
  password: string
}

const getUsers = () : Promise<User[]> =>
  Promise.resolve([
    { id: 1, role: 'admin', email: 'admin@jangle.com', password: 'admin' },
    { id: 2, role: 'editor', email: 'editor@jangle.com', password: 'editor' }
  ])

const getUser = (email : string, password : string) : Promise<User> =>
  getUsers()
    .then(users => {
      const user = users.filter(user => user.email === email && user.password === password )[0]
      return user
        ? Promise.resolve(user)
        : Promise.reject('Could not find user.')
    })

const getUserWithId = (id: Id) : Promise<User> =>
    getUsers()
      .then(users => {
        const user = users.filter(user => user.id === id)[0]
        return user ? Promise.resolve(user) : Promise.reject('No user with that id')
      })

const jwtOptions : StrategyOptions = {
  secretOrKey: process.env.SECRET || 'super-secret-secret',
  jwtFromRequest: ExtractJwt.fromAuthHeaderWithScheme('jwt')
}

const strategy = new Strategy(jwtOptions, (payload : JwtPayload | undefined, done) =>
  (payload == null)
    ? done('No payload received', undefined)
    : getUserWithId(debug<JwtPayload>('payload')(payload).id)
      .then(user => done(false, user))
      .catch(reason => done(reason, undefined))
)

passport.use(strategy)

type Token = string

const getToken = (email : string, password : string) : Promise<Token> =>
  getUser(email, password).then(user => (user)
    ? Promise.resolve(jwt.sign({ id: user.id }, jwtOptions.secretOrKey))
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
          data: undefined
        })
      } else {
        getToken(email, password)
          .then(token => res.json({
            error: false,
            message: 'Login successful!',
            data: token
          }))
          .catch(reason => res.json({
            error: true,
            message: reason,
            data: undefined
          }))
      }
    }
  }
} 

