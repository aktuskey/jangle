import { db } from '../data'
import { UserInfo } from '../types'

type UserMutation = {
  user: UserInfo
}

type UserQuery = {
  slug: string
}

export const resolvers = {
  Query: {
    collections: () =>
      Promise.resolve([]),
    users: () =>
      db.users.get(),
    user: (_: any, { slug } : UserQuery) =>
      db.users.findWithSlug(slug)
  },
  Mutation: {
    createUser: (_ : any, userMutation : UserMutation ) =>
      db.users.create(userMutation.user)
  }
}
