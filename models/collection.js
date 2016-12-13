var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var FieldSchema = include('models/schemas/field.js');
var JangleMetaSchema = include('models/schemas/jangle-meta.js')

var CollectionSchema = new Schema(
    {
        // TODO: Make use 'unique' validator
        name: { type: String, required: true, lowercase: true, trim: true, index: true },
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
        ordered: { type: Boolean, default: false },
        jangle: { type: JangleMetaSchema, required: true, default: {} }
    },
    {
        versionKey: false // You should be aware of the outcome after set to false
    }
);

module.exports = mongoose.model('jangle.collections', CollectionSchema);
