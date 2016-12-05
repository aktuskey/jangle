var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var FieldTypeSchema = new Schema(
    {
        name: String,
        label: String,
        type: String, // DataType
        options: [String]
    }
);

module.exports = mongoose.model('FieldType', FieldTypeSchema);