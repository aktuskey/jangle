import { db } from '../data'
import { Map } from '../types'

type UpdateUserMutation = {
  slug: string,
  firstName: string | null,
  lastName: string | null,
  email: string | null,
  password: string | null
}

type CreateUserMutation = {
  firstName: string,
  lastName: string,
  email: string,
  role: string,
  password: string
}

type RemoveUserMutation = {
  slug: string
}

type RemoveUsersMutation = {
  slugs: string[]
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
    createUser: (_ : any, { firstName, lastName, email, role, password } : CreateUserMutation) =>
      db.users.create({ name: { first: firstName, last: lastName }, password, role, email }),
    updateUser: (_: any, { slug, firstName, lastName, email, password} : UpdateUserMutation) =>
      db.users.updateWithSlug(slug, buildChanges({
        'name.first': firstName, 'name.last': lastName, email, password
      })),
    removeUser: (_ : any, removeUserMutation : RemoveUserMutation) =>
      db.users.removeWithSlug(removeUserMutation.slug),
    removeUsers: (_ : any, removeUserMutation : RemoveUsersMutation) =>
        Promise.all(removeUserMutation.slugs.map(
          slug => db.users.removeWithSlug(slug)
        ))
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
