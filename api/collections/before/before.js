module.exports = function(done) {

    return function(req, res, next) {

        let handleRejection = (reason) => {
            console.info(reason)
            done(req, res)
        }

        let setDefaultResponseTask = setDefaultResponse(req),
            checkForUserTokenTask = checkForUserToken(req),
            getMongoConnectionTask = getMongoConnection(req)

        setDefaultResponseTask()
            .success(checkForUserTokenTask)
            .success(getMongoConnectionTask)
            .then(next, handleRejection)

    }

}

let setDefaultResponse = function(req) {

    return function() {

        req.res = {
            status: 404,
            message: `Can't ${req.method} at ${req.baseUrl}`,
            data: []
        }

        return Promise.resolve()

    }

}

let checkForUserToken = function(req) {

    return function() {

        return new Promise(function(resolve, reject) {

            let token = req.query.token || req.body.token

            if (token === undefined) {

                req.usePublicData = true

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

                req.usePublicData = false

                let ADMIN_TOKEN = process.env.ADMIN_TOKEN || 'token'

                if (token !== ADMIN_TOKEN) {

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

let getMongoConnection = function(req) {

    return function() {

        return new Promise(function(resolve, reject) {

            // TODO: Remove global helpers, config, and mongoose object
            let connectionString = req.helpers.mongoose.getConnectionString(
                req.usePublicData,
                req.jangleConfig.mongodb
            )

            req.connection = req.mongoose.createConnection()

            req.connection.open(connectionString, function(error) {

                if (error) {

                    let message =
                        `Can't connect to the database.`

                    req.res = {
                        status: 500,
                        message: message,
                        data: []
                    }

                    reject(message)

                } else {

                    resolve()

                }

            }).catch( () => {

                let message =
                    `Can't open connection to the database.`

                req.res = {
                    status: 500,
                    message: message,
                    data: []
                }

                reject(message)

            })

        })

    }
}
