var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var FieldTypeSchema = new Schema({
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
	}, // DataType
	options: {
		type: Schema.Types.Mixed,
		required: true
	}
});

module.exports = mongoose.model('jangle.fieldTypes', FieldTypeSchema);