var models = include('models');

module.exports = function(req, res, next) {

    var collectionName = req.params.collectionName;

    if(req.model)
    {
      getDocuments(req,res,next);
    }
    else
    {
      models.getModel(req.connection, collectionName)
      .then(function(model){
        if(model)
        {
          req.model = model;
          getDocuments(req,res,next);
        }
        else
        {
          req.res = {
            status: 400,
            error: true,
            data: [],
            message: `Cannot find collection '${collectionName}'`
          };
          next();
        }
      });
    }

};

function getDocuments(req, res, next){

    var collectionName = req.params.collectionName;
    var docId = req.params.docId;
    var prefix = req.query.token ? '' : 'live ';
    var model = req.model;

    if(docId) {

        var docIdField = 'jangle.id';

        switch(collectionName) {
            case 'jangle.collections':
              docIdField = 'name';
              break;
        }

        var findOptions = {};
        findOptions[docIdField] = docId;

        findDocuments(req, res, next, findOptions);

    }
    else {
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

      req.res = {
        status: 200,
        error: false,
        data: documents,
        message: `Found ${documents.length} ${documentLabel} from '${collectionName}'`
      };
    }

    next();

  });

};
