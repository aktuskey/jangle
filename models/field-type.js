let mongoose = require('mongoose'),
	Schema = mongoose.Schema;

let FieldTypeSchema = new Schema({

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

});

try {
	module.exports = mongoose.model('jangle.fieldTypes', FieldTypeSchema);
} catch (ignore) {
	module.exports = mongoose.model('jangle.fieldTypes');
}