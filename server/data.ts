
const db = {
  collections: [
    {
      id: 1, name: 'people', label: { singular: 'Person', plural: 'People' }, fields: [
        {
          name: 'firstName',
          label: 'First Name',
          type: 'SingleLine',
          options: {
            isOptional: false,
            defaultValue: 'Ryan',
            regex: 'Rya'
          }
        }
      ]
    }
  ],
  users: [
    { id: 1, role: 'admin', email: 'ryan@jangle.com', password: 'password', name: { first: 'Ryan', last: 'Haskell-Glatz' }, slug: 'ryan-haskell-glatz' },
    { id: 2, role: 'editor', email: 'editor@jangle.com', password: 'password', name: { first: 'Alex', last: 'Hawley' }, slug: 'alex-hawley' }
  ]
}

export const getCollections = () => Promise.resolve(db.collections)

export const getAllUsers = () => Promise.resolve(db.users)
