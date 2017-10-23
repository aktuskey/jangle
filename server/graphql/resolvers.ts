import { db } from '../data'
import { UserInfo, Map } from '../types'

type CreateUserMutation = {
  user: UserInfo
}

type UpdateUserMutation = {
  slug: string,
  firstName: string | null,
  lastName: string | null,
  email: string | null,
  password: string | null
}

type RemoveUserMutation = {
  slug: string
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
    createUser: (_ : any, userMutation : CreateUserMutation) =>
      db.users.create(userMutation.user),
    updateUser: (_: any, { slug, firstName, lastName, email, password} : UpdateUserMutation) =>
      db.users.updateWithSlug(slug, buildChanges({
        'name.first': firstName, 'name.last': lastName, email, password
      })),
    removeUser: (_ : any, removeUserMutation : RemoveUserMutation) =>
      db.users.removeWithSlug(removeUserMutation.slug)
  }
}

const buildChanges = (obj: Map<string | null>) : Map<string> =>
  Object.keys(obj)
    .reduce((newObj : Map<string>, key: string): Map<string> => {
      const value = obj[key]
      if (value != null) {
        newObj[key] = value
      }
      return newObj
    }, {})