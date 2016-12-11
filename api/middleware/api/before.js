var mongoose = require('mongoose');
var apiAfter = include('api/middleware/api/after');

module.exports = function(req, res, next) {

    // Set up default response
    req.res = {
        status: 404,
        message: `Can't ${req.method} on ${req.baseUrl}`,
        error: true,
        data: []
    };

    console.log(`\n${req.method} ${req.originalUrl}`);

    // Check if user is authenticated
    var token = req.query.token;
    var noTokenProvided = token === undefined;
    var useLiveDatabase;

    if(noTokenProvided)
    {
        useLiveDatabase = true;

        // Only allow get requests to live database
        if(req.method !== 'GET')
        {
            var message = `A token is required for ${req.method} requests on '${req.originalUrl}'`;

            console.log(`|-> ${message}`);

            req.res = ({
                status: 401,
                message: message,
                error: true,
                data: []
            });

            return apiAfter(req,res);
        }
    }
    else
    {
        useLiveDatabase = false;
    }

    // Attempt to connect to MongoDB
    var connectionString = getConnectionString(useLiveDatabase);

    req.connection = mongoose.createConnection();

    req.connection.open(connectionString, function(error) {

        if(error)
        {
            var message = `Can't connect to the database.`;

            console.log(`|-> ${message}`);

            req.res = {
                status: 500,
                message: message,
                error: true,
                data: []
            };

            return apiAfter(req, res);
        }
        else
        {
            next();
        }
    });

};

var getConnectionString = (useLiveDatabase) => {

    var mongodb = global.config.mongodb;
    var authPrefix;
    var database;

    if(mongodb.auth)
        authPrefix = `${mongodb.rootUser}:${mongodb.rootPassword}@`;
    else
        authPrefix = '';

    if(useLiveDatabase)
        database = mongodb.liveDb;
    else
        database = mongodb.contentDb;

    var connectionString = `mongodb://${authPrefix}${mongodb.host}:${mongodb.port}/${database}`;

    return connectionString;
};
