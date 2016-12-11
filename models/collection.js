var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var FieldSchema = include('models/schemas/field.js');

var CollectionSchema = new Schema(
    {
        name: { type: String, required: true, lowercase: true, trim: true, unique: true },
        labels: {
            singular: { type: String, required: true, trim: true },
            plural: { type: String, required: true, trim: true }
        },
        fields: [ FieldSchema ],
        parent: Schema.Types.ObjectId, // Collection
        tags : [
            Schema.Types.ObjectId // Tag
        ],
        defaultDisplayField: Number, // Index into 'fields' structure?
        ordered: Boolean
    }
);

module.exports = mongoose.model('Collection', CollectionSchema);