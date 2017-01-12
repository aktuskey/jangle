let mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    FieldSchema = require('./schemas/field.js'),
    JangleMetaSchema = require('./schemas/jangle-meta.js');

let CollectionSchema = new Schema({

    // TODO: Make name field use 'unique' validator
    // It will need to make sure no other collection has a name
    name: {
        type: String,
        required: true,
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
