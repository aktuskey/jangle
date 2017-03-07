let mongoose = require('mongoose'),
    schema = require('./schemas/collection.js'),
    model = undefined

try {
    model = mongoose.model('jangle.collections', schema);
} catch (ignore) {
    model = mongoose.model('jangle.collections');
}

module.exports = model
