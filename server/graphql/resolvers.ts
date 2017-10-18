import { db } from '../data'
import { UserInfo } from '../types'

type UserMutation = {
  user: UserInfo
}

export const resolvers = {
  Query: {
    collections: () =>
      Promise.resolve([]),
    users: () =>
      db.users.get()
  },
  Mutation: {
    createUser: (_ : any, userMutation : UserMutation ) =>
      db.users.create(userMutation.user)
  }
}
