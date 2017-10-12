
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
  ]
}

export const getCollections = () =>Promise.resolve(db.collections)
