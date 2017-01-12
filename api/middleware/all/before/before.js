let include = global.include || ((path) => require(`../../../../${path}`));

module.exports = function(req, res, next) {

    let handleRejection = (err) => {
        console.log(err);
        req.done(req, res);
    };

    setDefaultResponse(req, res, next)
        .then(
            () => {
                checkForUserToken(req, res, next)
                    .then(
                        () => {
                            getMongoConnection(req, res, next)
                                .then(
                                    () => next(),
                                    handleRejection
                                )
                        },
                        handleRejection
                    )
            });


};

let setDefaultResponse = function(req, res, next) {

    req.res = {
        status: 404,
        message: `Can't ${req.method} on ${req.baseUrl}`,
        data: []
    };

    return Promise.resolve();

};

let checkForUserToken = function(req, res, next) {

    return new Promise(function(resolve, reject) {

        let token = req.query.token;

        if (token === undefined) {

            req.useLiveDatabase = true;

            // Only allow get requests to live database
            if (req.method !== 'GET') {

                let message =
                    `A token is required for ${req.method} requests on '${req.originalUrl}'`;

                req.res = ({
                    status: 401,
                    message: message,
                    data: []
                });

                reject(req.res.message);

            } else {

                resolve();

            }

        } else {

            req.useLiveDatabase = false;

            // TODO: Legitimate authentication pls.
            let ADMIN_TOKEN = process.env.ADMIN_TOKEN || 'token';

            if (token != ADMIN_TOKEN) {

                req.res = {
                    status: 401,
                    message: 'Invalid token.',
                    data: []
                };

                reject(req.res.message);

            } else {

                resolve();

            }

        }

    });

};

let getMongoConnection = function(req, res, next) {

    return new Promise(function(resolve, reject) {

        let connectionString = req.helpers.mongoose.getConnectionString(
            req.useLiveDatabase,
            req.jangleConfig.mongodb
        );

        req.connection = req.mongoose.createConnection();

        req.connection.open(connectionString, function(error) {

            console.log("Connection opened.")

            if (error) {

                let message =
                    `Can't connect to the database.`;

                req.res = {
                    status: 500,
                    message: message,
                    data: []
                };

            } else {

                resolve();

            }
            
        }).catch(reject);

    });
};
