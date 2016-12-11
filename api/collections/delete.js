var models = include('models');

module.exports = function(req, res, next) {

  // TODO: This boilerplate belongs in before API middleware. :facepalm:
  models.getCollectionModel(req, res, next)
    .then(function(){ deleteDocuments(req, res, next) });

};

function deleteDocuments(req, res, next) {

    var collectionName = req.params.collectionName;
    var docId = req.params.docId;

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

        removeDocuments(req, res, next, findOptions);

    }
    else
    {
        removeDocuments(req, res, next, {});
    }

};

function removeDocuments(req, res, next, findOptions) {

    var model = req.model;
    var collectionName = req.params.collectionName;

    var Model = req.connection.model(model.modelName, model.schema);

    // Get documents that will be removed.
    Model.find(findOptions, function(error, documents){

      if(error)
      {
        req.res = {
          status: 400,
          error: true,
          data: [],
          message: `${error}`
        };
        next();
      }
      else
      {
        // TODO: Replace with singular/plural form on collection model
        var documentLabel = documents.length != 1 ? 'documents' : 'document';

        console.log(`|-> ${documents.length} ${documentLabel}`);

        Model.remove(findOptions, function(error){

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
            req.res = {
              status: 200,
              error: false,
              data: documents,
              message: `Removed ${documents.length} ${documentLabel} from '${collectionName}'`
            };
          }

          next();
        });
      }


    });

};
