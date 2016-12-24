var models = global.include('models');
var self = {};

module.exports = function (req, res, next) {
    'use strict';

    models.getCollectionModel(req, res, next)
        .then(function () {
            self.getDocuments(req, next);
        });

};

self.getDocuments = function (req, next) {
    'use strict';

    var collectionName = req.params.collectionName;
    var docId = req.params.docId;

    if (docId) {

        var docIdField = 'jangle.id';

        switch (collectionName) {

        case 'jangle.collections':
            docIdField = 'name';
            break;

        }

        var findOptions = {};
        findOptions[docIdField] = docId;

        self.findDocuments(req, next, findOptions);

    } else {
        self.findDocuments(req, next, {});
    }

};

self.findDocuments = function (req, next, findOptions) {
    'use strict';

    var model = req.model;
    var collectionName = req.params.collectionName;

    var Model = req.connection.model(model.modelName, model.schema);

    Model.find(findOptions, function (error, documents) {

        if (error) {
            req.res = {
                status: 400,
                error: true,
                data: [],
                message: `${error}`
            };
        } else {
            var documentLabel = documents.length !== 1 ? 'documents' : 'document';

            console.log(`|-> ${documents.length} ${documentLabel} fetched.`);

            req.res = {
                status: 200,
                error: false,
                data: documents,
                message: `Found ${documents.length} ${documentLabel} in '${collectionName}'`
            };
        }

        next();

    });

};