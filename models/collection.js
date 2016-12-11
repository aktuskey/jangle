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
        defaultDisplayField: { type: Number, default: 0 }, // Index into 'fields' structure?
        ordered: { type: Boolean, default: false}
    }
);

module.exports = mongoose.model('jangle.collections', CollectionSchema);
