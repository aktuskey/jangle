let mongoose = require('mongoose'),
	Schema = mongoose.Schema,
	FieldSchema = require('./schemas/field.js');

let SingletonSchema = new Schema({
	name: {
		type: String,
		required: true,
		lowercase: true,
		trim: true,
		unique: true
	},
	labels: {
		type: String,
		required: true,
		trim: true
	},
	fields: [FieldSchema],
	tags: [Schema.Types.ObjectId]
});

let Singleton = mongoose.model('jangle.singletons') ?
	mongoose.model('jangle.singletons') : mongoose.model('jangle.singletons', SingletonSchema);

module.exports = Singleton;