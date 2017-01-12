module.exports = {

    mongoose: require('./mongoose'),

    getConnectionString: (useLiveDatabase, config) => {

        let authPrefix,
            database;

        if (config.auth) {

            authPrefix = `${config.rootUser}:${config.rootPassword}@`;

        } else {

            authPrefix = '';

        }

        if (useLiveDatabase) {

            database = config.liveDb;

        } else {

            database = config.contentDb;

        }

        let connectionString =
            `mongodb://${authPrefix}${config.host}:${config.port}/${database}`;

        return connectionString;
    },

    getCollectionModel: function(req, res, next) {

        let metaPrefix = 'jangle.',
            collectionName = req.params.collectionName,
            isMetaCollection = (collectionName.indexOf(metaPrefix) ===
                0);

        return new Promise(function(resolve, reject) {

            if (isMetaCollection) {

                let model;

                switch (collectionName) {
                    case 'jangle.collections':
                        model = include('models/collection');
                        break;
                    case 'jangle.fieldType':
                        model = include('models/field-type');
                        break;
                    default:
                        model = undefined;
                        break;
                }

                if (model !== undefined) {

                    req.model = model;

                    resolve();

                } else {

                    req.res = {
                        status: 404,
                        message: `Can't find meta collection '${collectionName}'.`,
                        data: []
                    };

                    reject();
                }

            } else {

                let jangleCollectionsModel =
                    include('models/collection');

                let fieldTypesModel =
                    include('models/field-type');

                let JangleCollectionsModel =
                    req.connection.model(
                        jangleCollectionsModel.modelName,
                        jangleCollectionsModel.schema
                    );

                let FieldTypesModel =
                    req.connection.model(
                        fieldTypesModel.modelName,
                        fieldTypesModel.schema
                    );

                // TODO: Sort by version/last published.
                let findOptions = {
                    name: collectionName
                };

                JangleCollectionsModel.findOne(findOptions, function(err, collectionMeta) {

                    if (err || collectionMeta == undefined) {

                        req.res = {
                            status: 404,
                            message: `Could not find collection '${collectionName}'.`,
                            data: []
                        };

                        reject();

                    } else {

                        let collectionDocument = collectionMeta.toObject();

                        FieldTypesModel.find().exec(function(err, fieldTypes) {

                            if (err) {

                                req.helpers.mongoose.attemptToCreateFieldTypes(req, res, function(){

                                    let modelName = collectionMeta.name;

                                    let schema =
                                        req.helpers.mongoose.getSchemaFromCollection(
                                            collectionDocument.fields,
                                            fieldTypes
                                        );

                                    if(schema === undefined) {

                                        reject();

                                    } else {

                                        // TODO: Check for indexed fields in the future
                                        req.ignoreIndexedFields = true;
                                        req.model = req.connection.model(modelName, schema);

                                        resolve();

                                    }

                                }, function(err){

                                    req.res = {
                                        status: 500,
                                        message: `Could not get field types.`,
                                        data: []
                                    };

                                    reject();

                                });

                            } else {

                                // TODO: Cleanup this duplication, it's gross.
                                let modelName = collectionMeta.name;

                                let schema =
                                    req.helpers.mongoose.getSchemaFromCollection(
                                        collectionDocument.fields,
                                        fieldTypes
                                    );

                                if(schema === undefined) {

                                    reject();

                                } else {

                                    // TODO: Check for indexed fields in the future
                                    req.ignoreIndexedFields = true;
                                    req.model = req.connection.model(modelName, schema);

                                    resolve();

                                }

                            }

                        });
                    }

                });
            }

        });

    },

    attemptToCreateFieldTypes: function(req, res, resolve, reject) {

        let fieldTypesModel = include('models/field-type'),
            initialFieldTypes = include('models/initial/field-type');

        let FieldTypesModel =
            req.connection.model(
                fieldTypesModel.modelName,
                fieldTypesModel.schema
            );

        FieldTypesModel.create(initialFieldTypes, function (error) {
            if (error) {

                reject(error);

            } else {

                resolve();

            }
        });

    }


};
