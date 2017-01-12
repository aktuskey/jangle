let self = this;

module.exports = function(req, res, next) {
    'use strict';
    models.getCollectionModel(req, res, next)
        .then(function() {
            self.deleteDocuments(req, next);
        });

};

self.deleteDocuments = function(req, next) {
    'use strict';

    let collectionName = req.params.collectionName;
    let docId = req.params.docId;

    if (docId) {

        let docIdField = 'jangle.id';

        switch (collectionName) {
            case 'jangle.collections':
                docIdField = 'name';
                break;
        }

        let findOptions = {};
        findOptions[docIdField] = docId;

        self.removeDocuments(req, next, findOptions);

    } else {
        self.removeDocuments(req, next, {});
    }

};

self.removeDocuments = function(req, next, findOptions) {
    'use strict';

    let model = req.model;
    let collectionName = req.params.collectionName;

    let Model = req.connection.model(model.modelName, model.schema);

    // Get documents that will be removed.
    Model.find(findOptions, function(error, documents) {

        if (error) {
            req.res = {
                status: 400,
                error: true,
                data: [],
                message: `${error}`
            };
            next();
        } else {

            let documentLabel = (documents.length !== 1) ?
                'documents' : 'document';

            console.log(
                `|-> ${documents.length} ${documentLabel} removed.`
            );

            Model.remove(findOptions, function(error) {

                if (error) {
                    req.res = {
                        status: 400,
                        error: true,
                        data: [],
                        message: `${error}`
                    };
                } else {
                    req.res = {
                        status: 200,
                        error: false,
                        data: documents,
                        message: `Removed ${documents.length} ${documentLabel} from '${collectionName}'`
                    };
                }

                next();
            });
        }


    });

};
