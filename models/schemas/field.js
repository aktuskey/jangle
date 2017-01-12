let mongoose = require('mongoose');
let Schema = mongoose.Schema;

module.exports = new Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        lowercase: true
    },
    label: {
        type: String,
        required: true,
        trim: true
    },
    type: {
        type: String,
        required: true,
        trim: true,
        lowercase: true
    }, // FieldType
    required: {
        type: Boolean,
        required: true,
        default: false
    },
    // If not detecting Mixed field changes: markModified
    default: Schema.Types.Mixed,
    helpText: {
        type: String,
        trim: true
    },
    options: [{
        key: {
            type: String,
            required: true,
            trim: true
        },
        value: Schema.Types.Mixed
    }]
}, {
    _id: false
});
