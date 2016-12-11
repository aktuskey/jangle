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

    getModel: function(connection, collectionName) {

        var collection = connection.collection('jangle.collections');

        return collection.findOne({name:collectionName})
            .then(function(result){
                console.log(`Can't find '${collectionName}'`);
                return result;
            });

    }

};
