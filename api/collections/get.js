module.exports = function(req, res) {

    var token = req.query.token;
    var prefix = (token) ? '' : 'live ';

    var collectionName = req.params.collectionName;

    if(collectionName) {
        res.status(200).send(`Get ${prefix}collection '${collectionName}'.`);
    }
    else {
        res.status(200).send(`Get all ${prefix}collections.`);
    }

};