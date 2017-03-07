let mongoose = require('mongoose'),
    Schema = mongoose.Schema

module.exports = new Schema({

    id: {
        type: Schema.Types.ObjectId,
        required: true,
        default: function () {
            return mongoose.Types.ObjectId()
        }
    },

    previousVersions: {
        type: Schema.Types.Array,
        required: true,
        default: []
    },

    publishedVersion: {
        type: Number,
        required: true,
        default: -1
    }

}, {

    _id: false

})
