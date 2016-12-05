var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var SingletonSchema = new Schema(
    {
        name: String,
        labels: String,
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
        tags : [
            Schema.Types.ObjectId // Tag
        ]
    }
);

module.exports = mongoose.model('Singleton', SingletonSchema);