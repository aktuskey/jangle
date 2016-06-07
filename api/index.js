var mongoose = require('mongoose');
var jwt = require('jsonwebtoken');

module.exports = function(router) {
  
    // Attempt database connection
    console.log('Attempting to connect...');

    var url = process.env.CMS_DB_URL;
    var username = process.env.CMS_DB_USER;
    var password = process.env.CMS_DB_PWD;
    var connectionString = 'mongodb://'+username+':'+password+'@'+url;

    mongoose.connect(connectionString).then(function(){
        console.log('connected to database!');
    });

    // Secret for Tokenization
    var secret = ''+Math.random()*Number.MAX_SAFE_INTEGER;

    // Sign In API
    require('./sign-in-api')(router, secret);

    // Authentication Middleware
    router.use(function(req, res, next){

        var token = req.query.token;

        if(token) 
        {
            jwt.verify(token, secret, function(err, authenticatedUser){

                if(err)
                    return res.status(403).json('Failed to authenticate token.');
                else
                {
                    req.role = authenticatedUser.role;
                    next();
                }

            });
        }
        else
        {
            return res.status(403).send('No token provided');
        }

    });

    // User API
    require('./user-api')(mongoose, router);
    
    // Collection API
    require('./collection-api')(mongoose, router);


};