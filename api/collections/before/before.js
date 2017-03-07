module.exports = function(done) {

    return function(req, res, next) {

        let handleRejection =
            req.utilities.logging.handleRejection(req, res, done)

        let checkForUserTokenTask = checkForUserToken(req),
            getMongoConnectionTask = getMongoConnection(req),
            getModelTask = getModel(req)

        checkForUserTokenTask()
            .success(getMongoConnectionTask)
            .success(getModelTask)
            .then(next, handleRejection)

    }

}

let checkForUserToken = function (req) {

    return function() {

        return new req.promise(function(resolve, reject) {

            req.token = req.query.token || req.body.token

            if (req.token === undefined) {

                // Only allow get requests to live database
                if (req.method !== 'GET') {

                    let message =
                        `A token is required for ${req.method} requests at '${req.originalUrl}'`

                    req.res = ({
                        status: 401,
                        message: message,
                        data: []
                    })

                    reject(req.res.message)

                } else {

                    resolve()

                }

            } else {

                let ADMIN_TOKEN = req.env.ADMIN_TOKEN || 'token'

                if (req.token !== ADMIN_TOKEN) {

                    req.res = {
                        status: 401,
                        message: 'Invalid token.',
                        data: []
                    }

                    reject(req.res.message)

                } else {

                    resolve()

                }

            }

        })

    }

}

let getMongoConnection = function (req) {

    return function() {

        return new req.promise(function(resolve, reject) {

            let connectionString =
                req.utilities.database.getConnectionString(req.config)

            req.connection = req.mongoose.createConnection()

            req.connection.open(connectionString, function(error) {

                if (error) {

                    handleConnectionError(req, reject)

                } else {

                    console.info('Opened connection...')

                    resolve()

                }

            }).catch( () => handleConnectionError(req, reject) )

        })

    }
}

let getModel = function (req) {

    return function () {

        return new req.promise( function (resolve, reject) {

            let collectionName = req.params.collectionName

            console.log(`Getting model for '${collectionName}'...`)

            req.utilities.database.getModel(
                req,
                collectionName,
                function(model) {

                    req.model = model
                    
                    resolve()

                },
                reject
            )

        })


    }

}

let handleConnectionError =  function (req, reject) {

    let message =
        `Can't connect to the database.`

    req.res = {
        status: 500,
        message: message,
        data: []
    }

    reject(message)

}
