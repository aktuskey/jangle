var mongoose = require('mongoose');

module.exports = function(router) {
  
    // Attempt database connection
    console.log('Attempting to connect...');

    var url = process.env.CMS_DB_URL;
    var username = process.env.CMS_DB_USER;
    var password = process.env.CMS_DB_PWD;
    var connectionString = 'mongodb://'+username+':'+password+'@'+url;

    mongoose.connect(connectionString);

    router.route('/')

        .get(function(req, res){
            res.json('')
        })

    // User API
    require('./user-api')(router);

};