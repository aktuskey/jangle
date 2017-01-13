module.exports = {

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

                            if (err || fieldTypes.length == 0) {

                                req.helpers.mongoose.attemptToCreateFieldTypes(req, res, function(createdFieldTypes){

                                    fieldTypes = createdFieldTypes;

                                    req.helpers.mongoose.setModel({
                                        collectionMeta,
                                        req,
                                        collectionDocument,
                                        fieldTypes,
                                        resolve,
                                        reject
                                    });

                                }, function(err){

                                    req.res = {
                                        status: 500,
                                        message: `Could not get field types.`,
                                        data: []
                                    };

                                    reject();

                                });

                            } else {

                                req.helpers.mongoose.setModel({
                                    collectionMeta,
                                    req,
                                    collectionDocument,
                                    fieldTypes,
                                    resolve,
                                    reject
                                });

                            }

                        });
                    }

                });
            }

        });

    },

    setModel: function({collectionMeta, req, collectionDocument, fieldTypes, resolve, reject}) {

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

            schema.jangle = {
                id: {
                    type: req.mongoose.Schema.Types.ObjectId,
                    required: true,
                    default: function () {
                        return req.mongoose.Types.ObjectId();
                    }
                },
                version: {
                    type: Number,
                    required: true,
                    default: 1
                },
                published: {
                    type: Boolean,
                    required: true,
                    default: false
                }
            }

            try {

            	req.model = req.mongoose.model(
                    modelName,
                    new req.mongoose.Schema(schema)
                );

            } catch (ignore) {

            	req.model = req.mongoose.model(modelName);

            }

            resolve();

        }

    },

    attemptToCreateFieldTypes: function(req, res, resolve, reject) {

        let fieldTypesModel = include('models/field-type'),
            initialFieldTypes = include('models/initial/field-type');

        let FieldTypesModel =
            req.connection.model(
                fieldTypesModel.modelName,
                fieldTypesModel.schema
            );

        FieldTypesModel.create(initialFieldTypes, function (error, results) {
            if (error) {

                reject(error);

            } else {

                console.log(results);
                resolve(results);

            }
        });

    },

    getSchemaFromCollection: function(collectionFields, fieldTypes) {

        let schemaObject = {};

        for (let i in collectionFields) {

            let field = collectionFields[i];

            schemaObject[field.name] = {};

            // required
            if (field.required !== undefined) {
                schemaObject[field.name].required = field.required;
            }

            // default
            if (field.default !== undefined) {
                schemaObject[field.name].default = field.default;
            }

            // type
            let type = fieldTypes.filter((fieldType) => fieldType.name == field.type)[0];

            if (type !== undefined && type.type !== undefined) {
                schemaObject[field.name].type = type.type;
            }

            //console.log(`schemaObject[${field.name}]`)

            /* Add any schema properties from options
            if (type !== undefined) {

                for (let optionIndex in field.options) {

                    let optionKey = field.options[optionIndex].key;

                    switch (optionKey) {

                        case 'isMarkdown':
                            break;
                        case 'min':
                            break;
                        case 'max':
                            break;
                        case 'decimalPlaces':
                            break;
                        case 'collection':
                            break;
                        case 'displayField':
                            break;
                    }
                }

            }*/

        }

        return schemaObject;

    },

    getUniqueValidator: function(jangleConfig, mongoose, collectionName, uniquePropertyName) {

        let handleConnectionError = function() {

            console.log('Could not connect to database.');

            respond(false);

        };

        let mongooseHelpers = this;

        let validator = function(value, respond) {

            let jangleId = this.jangle.id;

            let connectionString = mongooseHelpers.getConnectionString(
                false, jangleConfig.mongodb
            );

            let connection = mongoose.createConnection();

            connection.open(connectionString, function(error) {

                if (error) {

                    handleConnectionError();

                } else {

                    let findOptions = {};

                    findOptions[uniquePropertyName] = value;

                    connection.model(collectionName).find(
                        findOptions,
                        function(err, results){

                        if(err) {

                            respond(false);

                        } else if (results.length > 0) {

                            respond(false);

                        } else {

                            respond(true);

                        }

                    })

                }

            })
            .catch(handleConnectionError);

        };

        return validator;

    },

    getFilterOptions: function(req) {

        let filterOptions = {};

        // SORT
        if(req.query.sort !== undefined) {

            filterOptions.sort = this.getSortOptions(req.query.sort);

        }

        // SELECT
        if(req.query.select !== undefined) {

            filterOptions.select = this.getSelectOptions(req.query.select);

        }

        // LIMIT
        if(req.query.limit !== undefined) {

            filterOptions.limit = this.getLimitOption(req.query.limit);

        }

        // SKIP
        if(req.query.skip !== undefined) {

            filterOptions.skip = this.getSkipOption(req.query.skip);

        }

        // TODO: POPULATE
        if(req.query.populate !== undefined) {

        }

        // TODO: Better WHERE (gt, lt, eq, ne, contains, etc.)
        if(req.query.where !== undefined) {

            filterOptions.where = this.getWhereOptions(req.query.where);

        }
        else {

            filterOptions.where = {};

        }

        console.log(filterOptions);

        return filterOptions;

    },

    getWhereOptions: function(whereQuery) {

        try {

            return JSON.parse(whereQuery);

        } catch(ignore) {

            console.log('Could not parse where query.');

            return {};

        }

    },

    // "-name,age,+created" -> { 'name': -1, 'age': 1, 'created': 1 }
    getSortOptions: function(sortQuery) {

        // Weirdness: '+' is replaced with ' '.
        //   This turns all ' ' back into '+'.
        sortQuery = sortQuery.split(' ').join('+');

        let sortQueryParts = sortQuery.split(',');

        let sortOptions = {}

        sortQueryParts.map(function(part) {

            if(part.indexOf('-') === 0) {

                let propName = part.substring(1);

                sortOptions[propName] = -1;

            } else if (part.indexOf('+') === 0) {

                let propName = part.substring(1);

                sortOptions[propName] = 1;

            } else {

                let propName = part;

                sortOptions[propName] = 1;

            }

        });

        return sortOptions;

    },

    getSelectOptions: function(selectQuery) {

        let selectQueryParts = selectQuery.split(',');

        let selectOptions = {};

        selectQueryParts.map(function(part) {

            if(part.indexOf('-') == 0) {

                let propName = part;

                selectOptions[propName] = 0;

            } else {

                let propName = part;

                selectOptions[propName] = 1;

            }

        });

        return selectOptions;

    },

    getLimitOption: function(limitQuery) {

        try {

            return parseInt(limitQuery);

        } catch (ignore) {

            console.log('invalid limit parameter');
            return -1;

        }

    },

    getSkipOption: function(skipQuery) {

        try {

            return parseInt(skipQuery);

        } catch (ignore) {

            console.log('invalid skip parameter');
            return -1;

        }

    }

};
