export const typeDefs : string = `
  type Collection {
    id: ID!
    name: String!
    label: CollectionLabel!
    fields: [Field]!
  }

  type CollectionLabel {
    singular: String!
    plural: String!
  }

  type Field {
    name: String!
    label: String!
    type: FieldType!
    options: FieldOptions!
  }

  enum FieldType {
    SingleLine
    MultiLine
    SingleChoice
    MultiChoice
    SingleRelation
    MultiRelation
  }

  # Used to configure fields.
  type FieldOptions {

    # If unset, user will be required to give this field a value.
    isOptional: Boolean!
    # Displayed near field to assist user.
    helpText: String
    # Default value when field is unset.
    defaultValue: String

    # Minimum characters allowed in field. - [ SingleLine ]
    minimumCharacters: Int
    # Maximum characters allowed in field. - [ SingleLine ]
    maximumCharacters: Int
    # A regular expression to validate the field with - [ SingleLine ]
    regex: String

  }

  # Used in Choice Fields
  type Choice {
    # Key is stored with document on save
    key: String!
    # Value is displayed to the user
    value: String!
  }

  type User {
    name: Name!
    fullName: String!
    slug: String!
    email: String!
    role: Role!
  }

  input NewUser {
    name: NameInput!
    email: String!
    password: String!
    role: String!
  }

  input NameInput {
    first: String!
    last: String!
  }

  type Name {
    first: String!
    last: String!
  }

  enum Role {
    admin
    editor
  }

  type Query {

    # Get a list of all collections
    collections(id: ID): [Collection!]!

    # Get a list of users
    users: [User!]!

    # Get a user by slug
    user(slug: String!): User!

  }

  type Mutation {

    # Create or update a user
    createUser(user: NewUser!): User

    # Update a user
    updateUser(slug: String!, firstName: String, lastName: String, email: String, password: String): User

    # Remove a user
    removeUser(slug: String!): User

  }
`
