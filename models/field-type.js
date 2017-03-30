'use strict'

let mongoose = require('mongoose')
let schema = require('./schemas/field-type')

let model

try {
  model = mongoose.model('jangle.fieldTypes', schema)
} catch (ignore) {
  model = mongoose.model('jangle.fieldTypes')
}

module.exports = model
