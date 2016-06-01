var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var collectionSchema = new Schema({
    name: {type: String, require: true, index: {unique: true}},
    description: {type: String}
});

module.exports = mongoose.model('cms.collections', collectionSchema);