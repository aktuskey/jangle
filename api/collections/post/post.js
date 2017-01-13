module.exports = function(req, res, next) {

    let handleRejection = (err) => {
        console.log('Rejection:', req.res.message);
        req.done(req, res);
    };

    req.helpers.mongoose.getCollectionModel(req, res, next)
        .then(
            () => {
                createDocument(req, res, next)
                    .then(
                        next,
                        handleRejection
                    )
            },
            handleRejection
        );

};

let createDocument = function(req, res, next) {

    let model = req.model;
    let data = req.query.data;
    let collectionName = req.params.collectionName;

    return new Promise(function (resolve, reject) {

        if (data) {

            try {

                let parsedData = JSON.parse(data);
                let Model =
                    req.connection.model(model.modelName, model.schema);

                try {

                    let saveTheThing = function() {

                        let newDocument = new Model(parsedData);

                        // TODO: Create custom 'unique' validator to allow user to define unique fields.
                        newDocument.save(function(error, result, numAffected) {

                            if (error) {

                                req.helpers.mongoose.handleCreateError(req, error);

                                reject();

                            } else {

                                // TODO: Replace with singular/plural form on collection model
                                let documentLabel = (numAffected != 1)
                                    ? 'documents' : 'document';

                                req.res = {
                                    status: 200,
                                    data: [ newDocument ],
                                    message: `Added ${numAffected} ${documentLabel} to '${collectionName}'`
                                };

                                resolve();
                            }

                        });

                    };

                    // Wait until indexes have been built or the model's index fields will be ignored.
                    if(req.ignoreIndexedFields) {

                        saveTheThing();

                    } else {

                        Model.on('index', saveTheThing);

                    }

                } catch (e) {

                    console.log(e);

                    req.res = {
                        status: 400,
                        data: [ parsedData ],
                        message: `Exception was thrown in POST on save.`
                    };

                    reject();

                }

            } catch (e) {

                req.res = {
                    status: 400,
                    data: [],
                    message: `The 'data' query option is not valid JSON.`
                };

                reject();

            }

        } else {

            req.res = {
                status: 400,
                data: [],
                message: `Please include the 'data' query option`
            };

            reject();
        }


    });

};
