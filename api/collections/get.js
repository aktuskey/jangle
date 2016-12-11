var models = include('models');

module.exports = function(req, res, next) {

    var token = req.query.token;
    var prefix = (token) ? '' : 'live ';

    var collectionName = req.params.collectionName;
    var docId = req.params.docId;

    var model = req.model || models.getModelFromCollections(collectionName);


    if(docId) {
        req.res = {
          status: 200,
          error: false,
          data: [],
          message: `Get ${prefix}document '${docId}' from '${collectionName}'`
        };
    }
    else {
        req.res = {
          status: 200,
          error: false,
          data: [],
          message: `Get ${prefix}documents from '${collectionName}'`
        };
    }

    next();

};
