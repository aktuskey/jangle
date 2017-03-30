let mongoose = require('mongoose')
let schema = require('./schemas/collection')

let model

try {
  model = mongoose.model('jangle.collections', schema)
} catch (ignore) {
  model = mongoose.model('jangle.collections')
}

module.exports = model
