module.exports = function(done) {

    return function(req, res, next) {

        let handleRejection =
            req.utilities.logging.handleRejection(req, res, done)

        let checkForUserTokenTask = checkForUserToken(req),
            getMongoConnectionTask = req.utilities.database.getMongoConnection(req),
            getModelTask = getModel(req)

        checkForUserTokenTask()
            .success(getMongoConnectionTask)
            .success(getModelTask)
            .then(() => {

                console.info(`\n${req.method}:\t${req.params.collectionName}`)

                next()

            }, handleRejection)

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

let getModel = function (req) {

    return function () {

        return new req.promise( function (resolve, reject) {

            let collectionName = req.params.collectionName

            req.utilities.database.getModel(
                req,
                collectionName,
                function(model) {

                    req.model = model

                    req.Model = req.connection.model(
                        model.modelName,
                        model.schema
                    )

                    resolve()

                },
                reject
            )

        })


    }

}
