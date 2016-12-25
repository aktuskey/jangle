var include = (include) ? include : (path) => require(`../../../../${path}`);

var collectionModel = include('models/collection.js');

module.exports = function (req, res, next) {

    var metaCollectionName = req.params.metaCollectionName;
    var metaCollectionId = req.params.metaCollectionId;

    getPredefinedModel(metaCollectionName)
        .then(function (model) {

            req.model = model;

            if (metaCollectionId)
                req.url = `/api/collections/jangle.${metaCollectionName}/${metaCollectionId}`;
            else
                req.url = `/api/collections/jangle.${metaCollectionName}`;

            next();

        });

};

var getPredefinedModel = function (collectionName) {

    return new Promise(function (resolve, reject) {

        var predefinedModel = null;

        switch (collectionName) {

        case 'collections':
            predefinedModel = collectionModel;
            break;

        }

        if (predefinedModel !== null)
            resolve(predefinedModel);
        else
            reject(`Can't find 'jangle.${collectionName}'`);

    });

};