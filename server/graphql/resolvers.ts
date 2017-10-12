import { getCollections } from '../data'

export const resolvers = {
  Query: {
    collections: getCollections
  }
}
