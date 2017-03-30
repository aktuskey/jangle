let mongoose = require('mongoose')
let Schema = mongoose.Schema

module.exports = new Schema({

  previousVersions: {
    type: Schema.Types.Array,
    required: true,
    default: []
  },

  publishedVersion: {
    type: Number,
    required: true,
    default: -1
  }

}, {

  _id: false

})
