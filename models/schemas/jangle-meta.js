var mongoose = require('mongoose');
var Schema = mongoose.Schema;

module.exports = new Schema({
    id: { type: Schema.Types.ObjectId, required: true, default: function() {
            return mongoose.Types.ObjectId();
        } },
    version: { type: Number, required: true, default: 1 },
    wasLastPublished: { type: Boolean, required: true, default: false }
  },{ _id: false}
);
