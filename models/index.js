module.exports = {

  getModel: function (connection, collectionName) {

    var collection = connection.collection('jangle.collections');

    return collection.findOne({
        name: collectionName
      })
      .then(function (result) {
        console.log(`|-> Can't find '${collectionName}'`);
        return result;
      });

  },

  getCollectionModel: function (req, res, next) {

    return new Promise(function (resolve, reject) {

      var collectionName = req.params.collectionName;

      if (req.model) {
        resolve(req, res, next);
      } else {
        this.getModel(req.connection, collectionName)
          .then(function (model) {
            if (model) {
              req.model = model;
              resolve(req, res, next);
            } else {
              req.res = {
                status: 400,
                error: true,
                data: [],
                message: `Cannot find collection '${collectionName}'`
              };
              reject(req, res, next);
            }
          });
      }

    });

  }

};