module.exports = function(req, res, next) {

    let handleRejection = (err) => {
        console.log('Rejection:', req.res.message)
        req.done(req, res)
    }

    let getDocuments =
        req.helpers.mongoose.changeDocuments('find')

    req.helpers.mongoose.getCollectionModel(req, res, next)
        .then(
            () => {
                getDocuments(req, res, next)
                    .then(
                        next,
                        handleRejection
                    )
            },
            handleRejection
        )

}
