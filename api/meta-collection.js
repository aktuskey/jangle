module.exports = function(req, res, next) {

    var metaCollectionName = req.params.metaCollectionName;
    var metaCollectionId = req.params.metaCollectionId;

    if(metaCollectionId)
        req.url = `/api/collections/jangle.${metaCollectionName}/${metaCollectionId}`;
    else
        req.url = `/api/collections/jangle.${metaCollectionName}`;

    next();

};