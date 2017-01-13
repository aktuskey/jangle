module.exports = function(req, res, next) {

    let handleRejection = (err) => {
        console.log('Rejection:', req.res.message);
        req.done(req, res);
    };

    let updateDocuments =
        req.helpers.mongoose.changeDocuments('update');

    req.helpers.mongoose.getCollectionModel(req, res, next)
        .then(
            () => {
                updateDocuments(req, res, next)
                    .then(
                        next,
                        handleRejection
                    )
            },
            handleRejection
        );

};
