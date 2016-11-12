const mongodb = require('mongodb');
const connectionInfo = include('connectionInfo.js');
const collection = 'jangle.content.collection';

const checkNameMiddleware = (req, res, next) => {

  const name = req.params.collectionName;

  if(name === undefined)
  {
    res.status(400).json({
      data: newData,
      error: 'No collection name provided.'
    });
  }
  else
  {
    next(name);
  }

};

module.exports = {

  get: (req, res) => {

    const db = req.db;

    db.collection(collection).find().toArray(function(err, docs){

      if(err)
      {
        res.status(403).json({
          error: err.message
        });
      }
      else
      {
        res.status(200).json({
          data: docs
        });
      }

    });

  },

  post: (req, res) => {

    const db = req.db;
    const newCollection = req.query.data || {
      name: 'example-collection',
      label: 'Example Collection',
      description: 'Just an example collection',
      fields: [],
      order: 1
    };

    db.collection(collection).insertOne(newCollection, function(err, result){

      if(err)
      {
        res.status(400).json({
          data: newCollection,
          error: err.message
        });
      }
      else
      {
        res.status(201).json({
          data: newCollection
        });
      }

    });

  },

  put: (req, res) => {

    const db = req.db;

    var newData;

    if(req.query.data !== undefined)
    {
      try {
        newData = JSON.parse(req.query.data);
      }
      catch (e) {
        return res.status(400).json({
          data: [],
          error: '"data" parameter is not a valid JSON object.'
        });
      }
    }
    else
    {
      newData = {
        description: 'Updated example collection'
      };
    }

    checkNameMiddleware(req,res, function(name) {

      db.collection(collection).update(
        { name: name },
        { $set: newData },
        function(err, r){

          if(err)
          {
            res.status(400).json({
              data: [],
              error: err.message
            });
          }
          else
          {
            res.status(200).json({
              data: r
            });
          }

      });
    });

  },

  delete: (req, res) => {

    const db = req.db;

    checkNameMiddleware(req,res, function(name) {

      db.collection(collection).remove(
        { name: name },
        function(err, r){

          if(err)
          {
            res.status(400).json({
              data: [],
              error: err.message
            });
          }
          else
          {
            res.status(200).json({
              data: r
            });
          }

      });
    });

  }

};
