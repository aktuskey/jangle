module.exports = function(req, res) {
  
    var collectionName = req.params.collectionName;

    if(collectionName) {
        res.status(200).send(`Remove collection '${collectionName}'.`);
    }
    else {
        res.status(200).send(`Remove all collections.`);
    }

};