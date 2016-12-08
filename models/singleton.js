var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var FieldSchema = include('models/schemas/field.js');

var SingletonSchema = new Schema(
    {
        name: { type: String, required: true, lowercase: true, trim: true, unique: true },
        labels: { type: String, required: true, trim: true },
        fields: [ FieldSchema ],
        tags : [ Schema.Types.ObjectId ] // Tag
    }
);

module.exports = mongoose.model('Singleton', SingletonSchema);