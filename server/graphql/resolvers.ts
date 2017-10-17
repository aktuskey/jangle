import { getCollections, getAllUsers } from '../data'

export const resolvers = {
  Query: {
    collections: getCollections,
    users: getAllUsers
  }
}
