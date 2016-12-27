var include = (include) ?
    include : (path) => require(`../../../../${path}`);

var mongoose = require('mongoose'),
    apiAfter = include('api/middleware/all/after'),
    fieldTypeModel = include('models/field-type.js'),
    initialDocuments = include('models/initial/field-type.js'),
    jangleConfig = include('default-config.js');

module.exports = function (req, res, next) {

    setDefaultResponse(req, res, next)
        .then(function () {

            return checkForUserToken(req, res, next);

        })
        .then(function () {

            return getMongoConnection(req, res, next)
                .then(next);

        })
        .catch(function () {

        });


};

var setDefaultResponse = function (req, res, next) {

    req.res = {
        status: 404,
        message: `Can't ${req.method} on ${req.baseUrl}`,
        error: true,
        data: []
    };

    return Promise.resolve();

};

var checkForUserToken = function (req, res, next) {

    return new Promise(function (resolve, reject) {

        var token = req.query.token;
        var noTokenProvided = token === undefined;

        if (noTokenProvided) {

            req.useLiveDatabase = true;

            // Only allow get requests to live database
            if (req.method !== 'GET') {

                var message = `A token is required for ${req.method} requests on '${req.originalUrl}'`;

                req.res = ({
                    status: 401,
                    message: message,
                    error: true,
                    data: []
                });

                apiAfter(req, res);
                reject();

            } else {

                resolve();

            }

        } else {

            req.useLiveDatabase = false;

            // TODO: Legitimate authentication pls.
            var ADMIN_TOKEN = process.env.ADMIN_TOKEN || 'token';

            if (token != ADMIN_TOKEN) {

                req.res = {
                    status: 401,
                    message: 'Invalid token.',
                    data: []
                };

                apiAfter(req, res);
                reject();

            } else {

                resolve();

            }

        }

    });

};

var getMongoConnection = function (req, res, next) {

    return new Promise(function (resolve, reject) {

        var connectionString =
            getConnectionString(req.useLiveDatabase, jangleConfig.mongodb);

        req.connection = mongoose.createConnection();

        req.connection.open(connectionString, function (error) {

            if (error) {

                var message = `Can't connect to the database.`;

                req.res = {
                    status: 500,
                    message: message,
                    error: true,
                    data: []
                };

                return apiAfter(req, res, req.done);

            } else {

                initializeJangleMetacollections(req.connection)
                    .then(resolve);

            }
        });

    });
};

// Field types will be created if the collection is empty
var initializeJangleMetacollections = function (connection) {

    return new Promise(function (resolve, reject) {

        var FieldType = connection.model(fieldTypeModel.modelName, fieldTypeModel.schema);

        FieldType.find(function (err, fieldTypes) {
            if (err) {

                console.log(err);

            } else if (fieldTypes.length == []) {

                return initializeFieldTypes(FieldType, resolve);

            }

            resolve();
        });

    });

};

var initializeFieldTypes = function (FieldType, resolve) {

    FieldType.create(initialDocuments, function (error) {
        if (error) {

            console.log(error);

        } else {

            resolve();

        }
    });

};

var getConnectionString = (useLiveDatabase, config) => {

    var authPrefix,
        database;

    if (config.auth) {

        authPrefix = `${config.rootUser}:${config.rootPassword}@`;

    } else {

        authPrefix = '';

    }

    if (useLiveDatabase) {

        database = config.liveDb;

    } else {

        database = config.contentDb;

    }

    var connectionString =
        `mongodb://${authPrefix}${config.host}:${config.port}/${database}`;

    return connectionString;
};