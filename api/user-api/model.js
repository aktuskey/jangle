var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var userSchema = new Schema({
    username: {type: String, require: true, index: {unique: true}},
    password: {type: String, require: true},
    role: {type: String, require: true}
});

module.exports = mongoose.model('cms.users', userSchema);