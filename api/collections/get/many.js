module.exports = function(req, res, next) {

    let handleRejection = (err) => {
        console.log('Rejection:', req.res.message);
        req.done(req, res);
    };

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
        );

};

let getDocuments = function(req, res, next) {

    let model = req.model;
    let collectionName = req.params.collectionName;

    var findOptions = {};

    return new Promise((resolve, reject) => {

        let Model = req.connection.model(model.modelName, model.schema);

        Model.find(findOptions, function(error, documents) {

            if (error) {

                req.res = {
                    status: 400,
                    data: [],
                    message: `${error}`
                };

                reject();

            } else {

                let documentLabel = documents.length !== 1 ?
                    'documents' : 'document';

                req.res = {
                    status: 200,
                    data: documents,
                    message: `Found ${documents.length} ${documentLabel} in '${collectionName}'`
                };

                resolve();
            }

        });

    })

};
