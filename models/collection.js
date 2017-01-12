let mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    helpers = include('helpers'),
    jangleConfig = include('default-config.js')
    FieldSchema = require('./schemas/field.js'),
    JangleMetaSchema = require('./schemas/jangle-meta.js');

let CollectionSchema = new Schema({

    name: {
        type: String,
        required: true,
        trim: true,
        index: true,
        validate: {
            validator: helpers.mongoose.getUniqueValidator(
                jangleConfig,
                mongoose,
                'jangle.collections',
                'name'
            ),
            msg: 'Collection with that name already exists.'
        }
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
