var models = include('models');
var R = require('ramda');

module.exports = function(req, res, next) {

      models.getCollectionModel(req, res, next)
        .then(function(){ changeDocuments(req, res, next) })

};

function changeDocuments(req, res, next) {

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


      updateDocuments(req, res, next, findOptions);

  }
  else
  {
      updateDocuments(req, res, next, {});
  }

};

function updateDocuments(req, res, next, findOptions) {

  var data = req.query.data;
  var docId = req.params.docId;

  if(data)
  {
    try {

      var parsedData = JSON.parse(data);

      if(Array.isArray(parsedData) || docId == undefined)
      {
        updateManyDocuments(req, res, next, parsedData, findOptions);
      }
      else {
        updateSingleDocument(req, res, next, parsedData, findOptions);
      }

    }
    catch (e){

      req.res = {
        status: 400,
        error: true,
        data: [],
        message: `The 'data' query option is not valid JSON.`
      };

      next();

    }

  }
  else {

    req.res = {
      status: 400,
      error: true,
      data: [],
      message: `Please include the 'data' query option.`
    };

    next();
  }

};

function updateManyDocuments(req, res, next, parsedData, findOptions) {

  req.res = {
    status: 501,
    error: true,
    data: [],
    message: 'Batch PUT statement not yet implemented.'
  };

  next();
}


function updateSingleDocument(req, res, next, parsedData, findOptions) {

  var model = req.model;
  var collectionName = req.params.collectionName;

  // TODO: Add 'unset' query option to allow removal of fields from documents.
  var propertiesToUnset = ['_id'];

  try {

    var Model = req.connection.model(model.modelName, model.schema);

    // Wait until indexes have been built
    // or the model's index fields will be ignored.
    Model.on('index', function(){

      var newDocument = parsedData;

      var sortOptions = { 'jangle.version': -1 };

      Model.find(findOptions).sort(sortOptions).limit(1).exec(function(fetchError, documents) {

        if(fetchError)
        {

          console.log(fetchError);

          req.res = {
            status: 400,
            error: true,
            data: [],
            message: `Error finding document to update.`
          };

          next();

        }
        else if (documents.length == 0) {

          var key = Object.keys(findOptions)[0];
          var val = findOptions[key];

          req.res = {
            status: 400,
            error: true,
            data: [],
            message: `Could not find document with '${key}' equal to '${val}'.`
          };

          next();

        }
        else
        {
          var oldDocument = documents[0]._doc;
          var updatedDocument = R.merge(oldDocument, newDocument);

          if(R.equals(updatedDocument, oldDocument))
          {
            req.res = {
              status: 301,
              error: false,
              data: [],
              message: `No changes made, collection not modified.`
            }
            next();
          }
          else
          {

            // Set jangle meta properties
            updatedDocument.jangle = {};
            updatedDocument.jangle = {
              id: oldDocument.jangle.id,
              version: oldDocument.jangle.version + 1,
              wasLastPublished: false
            }

            // Unset certain properties
            for(var i in propertiesToUnset)
            {
              var prop = propertiesToUnset[i];
              delete updatedDocument[prop];
            }

            var savedDocument = new Model(updatedDocument);

            savedDocument.save(function(error, result, numAffected){

                if(error)
                {
                  handleCreateError(req, res, next, error);
                }
                else
                {
                  // TODO: Replace with singular/plural form on collection model
                  var documentLabel = numAffected != 1 ? 'documents' : 'document';

                  console.log(`|-> ${numAffected} ${documentLabel} updated.`)

                  req.res = {
                    status: 200,
                    error: false,
                    data: [savedDocument],
                    message: `Add new document to '${collectionName}'`
                  };

                  next();
                }

              });

            }

          }

        });

      });

    }
  catch(e) {
    console.log(e);
    req.res = {
      status: 400,
      error: true,
      data: [parsedData],
      message: `Exception was thrown in POST on save.`
    };
    next();
  }

}

function handleCreateError(req, res, next, error) {

  console.log(error);
  var message = `There was a problem creating the new document.`;

  if(error.name == 'ValidationError')
  {
    message = `The 'data' option failed validation.`;

    var errorList = Object.keys(error.errors).map( x => error.errors[x] );
    var requiredFieldErrors = errorList.filter( x => x.kind == 'required');

    if(requiredFieldErrors.length > 0)
    {
      var missingRequiredFields = requiredFieldErrors.map( x => x.path );
      message = `Missing required fields: ${missingRequiredFields}`;
    }
  }
  else if(error.name == 'MongoError')
  {
    message = `There was a problem with MongoDB.`;

    switch(error.code)
    {
      case 11000:
        message = `A document with that key already exists.`
        break;
    }
  }

  req.res = {
    status: 400,
    error: true,
    data: [],
    message: message
  };

  next();

};
