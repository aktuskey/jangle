module.exports = function(req, res, next) {
  
    var collectionName = req.params.collectionName;
    var docId = req.params.docId;

    if(docId) {
        req.res.message = (`Remove document '${docId}' in '${collectionName}'`);    
    }
    else {
        req.res.message = (`Remove documents in '${collectionName}'`);    
    }

    next();

};