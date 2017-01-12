module.exports = function(req, res, next) {

    let handleRejection = (err) => {
        console.log(err);
        req.done(req, res);
    };

    req.helpers.getCollectionModel(req, res, next)
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

var createDocument = function(req, res, next) {

    let model = req.model;
    let data = req.query.data;
    let collectionName = req.params.collectionName;

    return new Promise(function (resolve, reject) {

        if (data) {

            try {

                let parsedData = JSON.parse(data);

                try {

                    let Model = req.connection.model(
                        model.modelName,
                        model.schema
                    );

                    let saveTheThing = function() {

                        let newDocument = new Model(parsedData);

                        // TODO: Create custom 'unique' validator to allow user to define unique fields.
                        newDocument.save(function(error, result, numAffected) {

                            if (error) {

                                handleCreateError(req, error);

                                reject();

                            } else {

                                // TODO: Replace with singular/plural form on collection model
                                let documentLabel = (numAffected != 1)
                                    ? 'documents' : 'document';

                                req.res = {
                                    status: 200,
                                    data: [ newDocument ],
                                    message: `Add new document to '${collectionName}'`
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

function handleCreateError(req, error) {

    let message = `There was a problem creating the new document.`;

    if (error.name == 'ValidationError') {

        message = `The 'data' option failed validation.`;

        let errorList = Object.keys(error.errors).map(x => error.errors[x]);

        let requiredFieldErrors = errorList.filter(x => x.kind == 'required');

        if (requiredFieldErrors.length > 0) {

            let missingRequiredFields =
                requiredFieldErrors.map(x => x.path);

            message =
                `Missing required fields: ${missingRequiredFields}`;
        }

    } else if (error.name == 'MongoError') {

        message = `There was a problem with MongoDB.`;

        switch (error.code) {
            case 11000:
                message = `A document with that key already exists.`
                break;
        }

    }

    req.res = {
        status: 400,
        data: [],
        message: message
    };

};
