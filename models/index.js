module.exports = {
    
    getPredefinedModel: function(collectionName) {

        var predefinedModel = null;

        switch(collectionName)
        {
            case 'collections':
                predefinedModel = include('models/collection.js');
                break;
        }

        if(predefinedModel !== null)
            return Promise.resolve(predefinedModel);
        else
            return Promise.reject(`Can't find 'jangle.${collectionName}'`);

    },

    getModelFromCollections: function(collectionName) {

        var collectionModel = include('models/collection.js');

        console.log(`Can't find '${collectionName}'`);

        return collectionModel
            .findOne({name:collectionName})
            .exec()
            .then(function(result){
                console.log(result);
            });

    }

};