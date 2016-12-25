var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    FieldSchema = require('./schemas/field.js'),
    JangleMetaSchema = require('./schemas/jangle-meta.js');

var CollectionSchema = new Schema({
    // TODO: Make use 'unique' validator
    name: {
        type: String,
        required: true,
        lowercase: true,
        trim: true,
        index: true
    },

    labels: {
        singular: {
            type: String,
            required: true,
            trim: true
        },
        plural: {
            type: String,
            required: true,
            trim: true
        }
    },

    fields: [FieldSchema],

    parent: Schema.Types.ObjectId,

    tags: [
        Schema.Types.ObjectId
    ],

    defaultDisplayField: {
        type: Number,
        default: 0
    }, // Index into 'fields' structure?

    ordered: {
        type: Boolean,
        default: false
    },

    jangle: {
        type: JangleMetaSchema,
        required: true,
        default: {}
    }

}, {
    versionKey: false
});

try {
    module.exports = mongoose.model('jangle.collections', CollectionSchema);
} catch (ignore) {
    module.exports = mongoose.model('jangle.collections');
}