module.exports = function(req, res, next) {

    let handleRejection = (err) => {
        console.log(err);
        req.done(req, res);
    };

    req.helpers.getCollectionModel(req, res, next)
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

    let Model = req.connection.model(model.modelName, model.schema);

    var findOptions = {};

    return new Promise((resolve, reject) => {

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
