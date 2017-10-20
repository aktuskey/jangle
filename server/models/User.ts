import { model, Model, Document, Schema } from 'mongoose'
import * as Types from '../types'

export interface UserModel extends Types.User, Document {
  password: string,
  fullName: string,
  slug: string
}

const schema = new Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  name: {
    first: {
      type: String,
      required: true,
      index: true
    },
    last: {
      type: String,
      required: true,
      index: true
    }
  },
  slug: {
    type: String,
    required: true
  },
  role: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  }
})

schema.virtual('fullName').get(function () {
  return [ this.name.first, this.name.last ].join(' ')
})

export const User : Model<UserModel> = model('User', schema)
