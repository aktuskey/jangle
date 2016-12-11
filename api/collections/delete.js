module.exports = function(req, res, next) {

    var collectionName = req.params.collectionName;
    var docId = req.params.docId;

    if(docId) {
        req.res = {
          status: 200,
          error: false,
          data: [],
          message: `Remove document '${docId}' in '${collectionName}'`
        };
    }
    else {
        req.res = {
          status: 200,
          error: false,
          data: [],
          message: `Remove documents in '${collectionName}'`
        };
    }

    next();

};
