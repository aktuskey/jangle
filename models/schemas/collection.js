'use strict'

let Schema = require('mongoose').Schema
let FieldSchema = require('./field.js')
let JangleMetaSchema = require('./jangle-meta.js')

module.exports = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true
    },

    labels: {
      singular: {
        type: String,
        required: true,
        trim: true
      },
      plural: {
        type: String,
        required: true,
        trim: true
      }
    },

    fields: [FieldSchema],

    jangle: {
      type: JangleMetaSchema,
      required: true,
      default: {}
    }
  },
  {
    versionKey: false
  }
)
