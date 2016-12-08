module.exports = function(req, res) {
  
    var collectionName = req.params.collectionName;
    var docId = req.params.docId;

    if(docId) {
        res.status(200).send(`Remove document '${docId}' in '${collectionName}'`);    
    }
    else {
        res.status(200).send(`Remove documents in '${collectionName}'`);    
    }

};