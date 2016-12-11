var models = include('models');

module.exports = function(req, res, next) {

  models.getCollectionModel(req, res, next)
    .then(function(){ getDocuments(req,res,next) });

};

function getDocuments(req, res, next){

    var collectionName = req.params.collectionName;
    var docId = req.params.docId;
    var prefix = req.query.token ? '' : 'live ';
    var model = req.model;

    if(docId)
    {

        var docIdField = 'jangle.id';

        switch(collectionName)
        {
            case 'jangle.collections':
              docIdField = 'name';
              break;
        }

        var findOptions = {};
        findOptions[docIdField] = docId;

        findDocuments(req, res, next, findOptions);

    }
    else
    {
        findDocuments(req, res, next, {});
    }

};

function findDocuments(req, res, next, findOptions){

  var model = req.model;
  var collectionName = req.params.collectionName;

  var Model = req.connection.model(model.modelName, model.schema);

  Model.find(findOptions, function(error, documents){

    if(error)
    {
      req.res = {
        status: 400,
        error: true,
        data: [],
        message: `${error}`
      };
    }
    else
    {
      // TODO: Replace with singular/plural form
      var documentLabel = documents.length != 1 ? 'documents' : 'document';

      console.log(`|-> ${documents.length} ${documentLabel}`);

      req.res = {
        status: 200,
        error: false,
        data: documents,
        message: `Found ${documents.length} ${documentLabel} in '${collectionName}'`
      };
    }

    next();

  });

};
