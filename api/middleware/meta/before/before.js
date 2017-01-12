module.exports = function(req, res, next) {

    let metaCollectionName = req.params.metaCollectionName;
    let metaCollectionId = req.params.metaCollectionId;

    req.url = (metaCollectionId) ?
        `/api/collections/jangle.${metaCollectionName}/${metaCollectionId}` :
        `/api/collections/jangle.${metaCollectionName}`;

    next();

};
