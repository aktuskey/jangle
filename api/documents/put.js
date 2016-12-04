module.exports = function(req, res) {
  
    var collectionName = req.params.collectionName;
    var docId = req.params.docId;

    res.status(200).send(`Update document '${docId}' in '${collectionName}'`);

};