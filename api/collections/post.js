module.exports = function(req, res, next) {
  
    var collectionName = req.params.collectionName;

    req.res.message = (`Add new document to '${collectionName}'`);

    next();

};