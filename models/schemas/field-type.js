let Schema = require('mongoose').Schema

module.exports = new Schema({

  name: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
    unique: true
  },

  label: {
    type: String,
    required: true,
    trim: true
  },

  type: {
    type: String,
    required: true,
    trim: true
  },

  options: {
    type: Schema.Types.Mixed,
    required: true
  }

})
