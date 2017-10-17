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

  type Query {

    # Get a list of all collections
    collections(id: ID): [Collection!]!

  }
`