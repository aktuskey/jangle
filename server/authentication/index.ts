import { Application, RequestHandler } from 'express'
import * as passport from 'passport'
import { Strategy, ExtractJwt, StrategyOptions } from 'passport-jwt'
import * as jwt from 'jsonwebtoken'
import { debug } from '../utils'

type Id = number

type JwtPayload = {
  id: Id
}

type Name = {
  first: String,
  last: String
}

type User = {
  id: Id
  role: string
  email: string,
  name: Name,
  password: string
}

const getUsers = () : Promise<User[]> =>
  Promise.resolve([
    { id: 1, role: 'admin', email: 'admin@jangle.com', password: 'password', name: { first: 'Admin', last: 'User' } },
    { id: 2, role: 'editor', email: 'editor@jangle.com', password: 'password', name: { first: 'Editor', last: 'User' } }
  ])

const getUser = (email : string, password : string) : Promise<User> =>
  getUsers()
    .then(users => {
      const user = users.filter(user => user.email === email && user.password === password )[0]
      return user
        ? Promise.resolve(user)
        : Promise.reject('Sorry, could not find that user.')
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

type SafeUser = {
  email : string,
  name : Name,
  token: Token
}

const getUserWithToken = (email : string, password : string) : Promise<SafeUser> =>
  getUser(email, password).then(user =>
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

