module.exports = function(req, res) {
  
    var token = req.query.token;
    var prefix = (token) ? '' : 'live ';

    var collectionName = req.params.collectionName;
    var docId = req.params.docId;


    if(docId) {
        res.status(200).send(`Get ${prefix}document '${docId}' from '${collectionName}'`);    
    }
    else {
        res.status(200).send(`Get ${prefix}documents from '${collectionName}'`);    
    }

};