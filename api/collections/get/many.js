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

    let filterOptions = req.helpers.mongoose.getFilterOptions(req);

    return new Promise((resolve, reject) => {

        let Model = req.connection.model(model.modelName, model.schema);

        if(filterOptions.where !== undefined) {
            Model = Model.find(filterOptions.where);
        }

        if(filterOptions.skip !== undefined) {
            Model = Model.skip(filterOptions.skip);
        }

        if(filterOptions.limit !== undefined) {
            Model = Model.limit(filterOptions.limit);
        }

        if(filterOptions.sort !== undefined) {
            Model = Model.sort(filterOptions.sort);
        }

        if(filterOptions.select !== undefined) {
            Model = Model.select(filterOptions.select);
        }

        Model.exec(function(error, documents) {

            if (error) {

                console.log(error);

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
