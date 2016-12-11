var models = include('models');

module.exports = function(req, res, next) {

    var metaCollectionName = req.params.metaCollectionName;
    var metaCollectionId = req.params.metaCollectionId;

    models
    .getPredefinedModel(metaCollectionName)
    .then(function(model) {

        req.model = model;

        if(metaCollectionId)
            req.url = `/api/collections/jangle.${metaCollectionName}/${metaCollectionId}`;
        else
            req.url = `/api/collections/jangle.${metaCollectionName}`;

        next();

    });

};
