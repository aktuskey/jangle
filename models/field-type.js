let mongoose = require('mongoose'),
	schema = require('./schemas/field-type'),
	model = undefined

try {
	model = mongoose.model('jangle.fieldTypes', schema)
} catch (ignore) {
	model = mongoose.model('jangle.fieldTypes')
}

module.exports = model
