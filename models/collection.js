var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var CollectionSchema = new Schema(
    {
        name: String,
        labels: {
            singular: String,
            plural: String
        },
        fields: [
            {
                name: String,
                label: String,
                type: Schema.Types.ObjectId, // FieldType
                required: Boolean,
                defaultValue: Schema.Types.Mixed,
                helpText: String,
                options: [
                    { 
                        key: String, 
                        value: Schema.Types.Mixed 
                    }
                ]
            }
        ],
        parent: Schema.Types.ObjectId, // Collection
        tags : [
            Schema.Types.ObjectId // Tag
        ],
        defaultDisplayField: Number // Index into 'fields' structure?
        ordered: Boolean
    }
);

module.exports = mongoose.model('Collection', CollectionSchema);