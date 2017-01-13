module.exports = function(req, res, next) {

    let handleRejection = (err) => {
        console.log('Rejection:', req.res.message);
        req.done(req, res);
    };

    let removeDocuments =
        req.helpers.mongoose.changeDocuments('remove');

    req.helpers.mongoose.getCollectionModel(req, res, next)
        .then(
            () => {
                removeDocuments(req, res, next)
                    .then(
                        next,
                        handleRejection
                    )
            },
            handleRejection
        );

};
