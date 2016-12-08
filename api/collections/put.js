module.exports = function(req, res) {
  
    var collectionName = req.params.collectionName;
    var docId = req.params.docId;

    if(docId) {
        res.status(200).send(`Update document '${docId}' in '${collectionName}'`);    
    }
    else {
        res.status(200).send(`Update documents in '${collectionName}'`);    
    }

};