var mongoose = require('mongoose');
const DISCONNECTED = 0, CONNECTED = 1;

module.exports = function(req, res, next) {

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

            res.status(401).json({
                message: message,
                error: true,
                data: []
            });
            return;
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

        // TODO: Move this to the end of all API requests.
        if(req.connection.readyState == CONNECTED)
            req.connection.close();

        if(error)
        {
            var message = `Can't connect to the database.`;

            console.log(`|-> ${message}`);
            res.status(500).json({
                message: message,
                error: true,
                data: []
            });
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