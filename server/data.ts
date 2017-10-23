import * as mongoose from 'mongoose'
import { User, UserModel } from './models/User'
import { UserInfo, Name, Map } from './types'
import { hash, sluggify } from './utils'

type ErrorMap = {
  [key: number]: string
}

type MongoError = {
  code: number,
  message: string
}

const handleMongoError = (errorMap: ErrorMap) => (error : MongoError) => {
  return errorMap[error.code]
    ? Promise.reject(errorMap[error.code])
    : Promise.reject(error.message)
}

(<any>mongoose).Promise = global.Promise
mongoose.connect(process.env.MONGO_URI || 'mongodb://mongo/jangle', { useMongoClient: true })

const rejectIfNull = <T>(message: string) => (thing: T | null): Promise<T> =>
  (thing === null)
    ? Promise.reject(message)
    : Promise.resolve(thing)

const createUser = ({ name, password, email, role} : UserInfo) : Promise<UserModel> =>
  User.create({
    name,
    email,
    role,
    slug: sluggify(name.first + ' ' + name.last),
    password: hash(password)
  })
  .catch(handleMongoError({ 11000: 'That email is already taken.' }))

export const db = {

  users: {

    hasUsers: () : Promise<boolean> =>
      User.count({}).exec().then(count => count > 0),

    createFirstUser: (email: string, password: string, name : Name) =>
      createUser({ email, password, name, role: 'admin' }),

    create: createUser,

    get: () : Promise<UserModel[]> =>
      User.find()
        .exec(),

    findWithLogin: (email : string, password: string) : Promise<UserModel> =>
      User.findOne({ email, password: hash(password) })
        .exec()
        .then(rejectIfNull('Could not find user with that login.')),

    findById: (id : string) : Promise<UserModel> =>
      User.findById(id)
        .exec()
        .then(rejectIfNull(`Could not find user with id: ${id}`)),

    findWithSlug: (slug : string) : Promise<UserModel> =>
      User.findOne({ slug })
        .exec()
        .then(rejectIfNull('Could not find a user with that slug.')),

    removeWithSlug: (slug : string) : Promise<UserModel> =>
      User.findOneAndRemove({ slug })
        .exec()
        .then(rejectIfNull('Could not find a user with that slug.')),

    updateWithSlug: (slug: string, changes: Map<string>) : Promise<UserModel> =>
      User.update({ slug }, changes)
        .exec()
        .then((_ : any) => User.findOne({ slug }).exec())
        .then(rejectIfNull('Could not find a user with that slug.'))

  }

}

// // TODO: Ask for initial login.
// const firstUser = {
//   email: 'admin@jangle.com',
//   password: 'password',
//   name: {
//     first: 'Ryan',
//     last: 'Haskell-Glatz'
//   },
//   role: 'admin'
// }

// db.users.create(firstUser).then(console.log).catch(() => {})
