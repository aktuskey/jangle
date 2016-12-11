module.exports = function(req, res, next) {

    var collectionName = req.params.collectionName;
    var docId = req.params.docId;

    if(docId) {
        req.res = {
          status: 200,
          error: false,
          data: [],
          message: `Update document '${docId}' in '${collectionName}'`
        };

        updateSingleDocument().then(next);
    }
    else {
        req.res = {
          status: 200,
          error: false,
          data: [],
          message: `Update documents in '${collectionName}'`
        };
    }

    next();

};

function updateSingleDocument(collectionName, docId, data) {
  return new Promise(function(resolve, reject){
    resolve();
  });
};
