module.exports = function(req, res, next) {
  
    var collectionName = req.params.collectionName;
    var docId = req.params.docId;

    if(docId) {
        req.res.message = (`Update document '${docId}' in '${collectionName}'`);    
    }
    else {
        req.res.message = (`Update documents in '${collectionName}'`);    
    }

    next();

};