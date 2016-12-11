var models = include('models');

module.exports = function(req, res, next) {

    var collectionName = req.params.collectionName;

    if (req.model)
    {
      createDocument(req, res, next);
    }
    else
    {
      models
      .getModel(req.connection, collectionName)
      .then(function(model){

        if (model == null)
        {
          req.res = {
            status: 400,
            error: true,
            message: `Could not find collection '${collectionName}'`,
            data: []
          };

          next();
        }
        else
        {
          req.model = model;
          createDocument(req, res, next);
        }

      });
    }

};

function createDocument(req, res, next) {

  var model = req.model;
  var data = req.query.data;
  var collectionName = req.params.collectionName;

  if(data)
  {
    try {

      var parsedData = JSON.parse(data);

      try {

        var Model = req.connection.model(model.modelName, model.schema);
        var newDocument = new Model(parsedData);

        newDocument.save(function(error, result, numAffected){

            if(error)
            {
              handleCreateError(req, res, next, error, parsedData);
            }
            else
            {
              req.res = {
                status: 200,
                error: false,
                data: [newDocument],
                message: `Add new document to '${collectionName}'`
              };

              next();
            }

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
      message: `Please include the 'data' query option`
    };

    next();
  }


};

function handleCreateError(req, res, next, error) {

  var message = `There was a problem creating the new document.`;

  console.log(error);

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
