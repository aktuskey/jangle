module.exports = function(req, res) {
  
    var collectionName = req.params.collectionName;

    res.status(200).send(`Add new document to '${collectionName}'`);

};