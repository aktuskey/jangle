var mongoose = require('mongoose');
var Schema = mongoose.Schema;

module.exports = new Schema({
    name: { type: String, required: true, trim: true, lowercase: true },
    label: { type: String, required: true, trim: true },
    type: Schema.Types.ObjectId, // FieldType
    required: Boolean,
    // If not detecting Mixed field changes: markModified
    defaultValue: Schema.Types.Mixed,
    helpText: { type: String, trim: true },
    options: [
        {
            key: { type: String, required: true, trim: true },
            value: Schema.Types.Mixed
        }
    ]
});
