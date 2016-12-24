var models = include('models');
var self = {};

module.exports = function(req, res, next) {
  'use strict';

  models.getCollectionModel(req, res, next)
    .then(function() {
      self.createDocument(req, next);
    })

};

function createDocument(req, res, next) {

  var model = req.model;
  var data = req.query.data;
  var collectionName = req.params.collectionName;

  if (data) {
    try {

      var parsedData = JSON.parse(data);

      try {

        var Model = req.connection.model(model.modelName, model.schema);

        // Wait until indexes have been built
        // or the model's index fields will be ignored.
        Model.on('index', function() {

          var newDocument = new Model(parsedData);
          console.log('|-> ', parsedData)

          // TODO: Create custom 'unique' validator to allow user to define unique fields.
          newDocument.save(function(error, result, numAffected) {

            if (error) {
              handleCreateError(req, res, next, error, parsedData);
            } else {
              // TODO: Replace with singular/plural form on collection model
              var documentLabel = numAffected != 1 ? 'documents' : 'document';

              console.log(`|-> ${numAffected} ${documentLabel} created.`)

              req.res = {
                status: 200,
                error: false,
                data: [newDocument],
                message: `Add new document to '${collectionName}'`
              };

              next();
            }

          });

        });

      } catch (e) {
        console.log(e);
        req.res = {
          status: 400,
          error: true,
          data: [parsedData],
          message: `Exception was thrown in POST on save.`
        };
        next();
      }

    } catch (e) {

      req.res = {
        status: 400,
        error: true,
        data: [],
        message: `The 'data' query option is not valid JSON.`
      };

      next();

    }

  } else {

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

  if (error.name == 'ValidationError') {
    message = `The 'data' option failed validation.`;

    var errorList = Object.keys(error.errors).map(x => error.errors[x]);
    var requiredFieldErrors = errorList.filter(x => x.kind == 'required');

    if (requiredFieldErrors.length > 0) {
      var missingRequiredFields = requiredFieldErrors.map(x => x.path);
      message = `Missing required fields: ${missingRequiredFields}`;
    }
  } else if (error.name == 'MongoError') {
    message = `There was a problem with MongoDB.`;

    switch (error.code) {
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