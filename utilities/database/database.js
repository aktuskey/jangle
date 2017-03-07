module.exports = {

    getConnectionString: (config) => {

        let authPrefix = (config.mongodb.auth)
            ? `${config.mongodb.rootUser}:${config.mongodb.rootPassword}@`
            : ''

        return `mongodb://${authPrefix + config.mongodb.host}:${config.mongodb.port}/${config.mongodb.database}`

    },

    getCollectionModel: function(collectionName, models, connection) {

        let self = this,
            metaPrefix = 'jangle.',
            isMetaCollection = collectionName.indexOf(metaPrefix) === 0,
            model = undefined

        return new Promise(function(resolve, reject) {

            if (isMetaCollection) {

                switch (collectionName) {

                    case 'jangle.collections':
                        model = models.collections
                        break

                    case 'jangle.fieldType':
                        model = models.fieldType
                        break

                }

                if (model !== undefined) {

                    resolve(model)

                } else {

                    reject(`Can't find 'jangle.${collectionName}'.`)
                }

            } else {

                let JangleCollectionsModel =
                        connection.model(
                            models.collection.modelName,
                            models.collection.schema
                        ),
                    FieldTypesModel =
                        connection.model(
                            models.fieldType.modelName,
                            models.fieldType.schema
                        )

                let findOptions = {
                    name: collectionName
                    //published: true
                }

                JangleCollectionsModel
                    .findOne(findOptions)
                    .sort('-jangle.version')
                    .exec( function(err, collectionMeta) {

                    if (err || collectionMeta === undefined) {

                        reject(`Could not find '${collectionName}'`)

                    } else {

                        let collectionDocument = collectionMeta.toObject()

                        FieldTypesModel.find().exec(function(err, fieldTypes) {

                            if (err || fieldTypes.length === 0) {

                                self.createFieldTypes(models, connection)
                                    .then( function (createdFieldTypes) {

                                        fieldTypes = createdFieldTypes

                                        resolve(self.getModel(collectionDocument, connection))

                                    }, reject)

                            } else {

                                resolve(self.getModel(collectionDocument, connection))

                            }

                        })
                    }

                })
            }

        })

    },

    getModel: function(collectionDocument, connection) {

        let self = this,
            name = collectionDocument.name,
            schema =
                self.getSchemaFromCollection(
                    collectionDocument.fields,
                    fieldTypes
                )

        if(schema === undefined) {

            return undefined

        } else {

                return connection.model(
                    name,
                    new connection.Schema(schema)
                )

        }

    },

    createFieldTypes: function(models, connection) {

        let initialFieldTypes = models.initial.fieldType,
            FieldTypesModel =
                connection.model(
                    models.fieldType.modelName,
                    models.fieldType.schema
                )

        return new Promise( (resolve, reject) => {

            FieldTypesModel.create(initialFieldTypes, function (error, fieldTypes) {

                if (error || fieldTypes === undefined) {

                    reject(error)

                } else {

                    resolve(fieldTypes)

                }
            })

        })

    },

    getSchemaFromCollection: function(collectionFields, fieldTypes) {

        let schemaObject = {}

        for (let i in collectionFields) {

            let field = collectionFields[i]

            schemaObject[field.name] = {}

            // required
            if (field.required !== undefined) {
                schemaObject[field.name].required = field.required
            }

            // default
            if (field.default !== undefined) {
                schemaObject[field.name].default = field.default
            }

            // type
            let types = fieldTypes.filter((fieldType) => fieldType.name == field.type),
                type = types[0]

            if (type !== undefined && type.type !== undefined) {
                schemaObject[field.name].type = type.type
            }

            //console.log(`schemaObject[${field.name}]`)

            /* Add any schema properties from options
            if (type !== undefined) {

                for (let optionIndex in field.options) {

                    let optionKey = field.options[optionIndex].key

                    switch (optionKey) {

                        case 'isMarkdown':
                            break
                        case 'min':
                            break
                        case 'max':
                            break
                        case 'decimalPlaces':
                            break
                        case 'collection':
                            break
                        case 'displayField':
                            break
                    }
                }

            }*/

        }

        return schemaObject

    },

    getFilterOptions: function(req) {

        let filterOptions = {}


        // TODO: Better WHERE (gt, lt, eq, ne, contains, etc.)
        if(req.query.where !== undefined) {

            filterOptions.where = this.getWhereOptions(req.query.where)

        } else {

            filterOptions.where = {}

        }

        if(req.params.docId !== undefined) {

            let idField = req.idField || '_id'

            filterOptions.where[idField] = req.params.docId

        }

        // TODO: SET
        if(req.query.set !== undefined) {

            let set = this.getSetOptions(req.query.set)

            if(set !== undefined)
                filterOptions.set = set

        }

        // UNSET
        if(req.query.unset !== undefined) {

            let unset = this.getUnsetOptions(req.query.unset)

            if(unset !== undefined)
                filterOptions.unset = unset

        }

        // SORT
        if(req.query.sort !== undefined) {

            filterOptions.sort = this.getSortOptions(req.query.sort)

        }

        // SELECT
        if(req.query.select !== undefined) {

            filterOptions.select = this.getSelectOptions(req.query.select)

        }

        // LIMIT
        if(req.query.limit !== undefined) {

            filterOptions.limit = this.getLimitOption(req.query.limit)

        }

        // SKIP
        if(req.query.skip !== undefined) {

            filterOptions.skip = this.getSkipOption(req.query.skip)

        }

        // TODO: POPULATE
        if(req.query.populate !== undefined) {

        }

        return filterOptions

    },

    getWhereOptions: function(whereQuery) {

        try {

            return JSON.parse(whereQuery)

        } catch(ignore) {

            console.log('Could not parse where query.')

            return {}

        }

    },

    // "-name,age,+created" -> { 'name': -1, 'age': 1, 'created': 1 }
    getSortOptions: function(sortQuery) {

        // Weirdness: '+' is replaced with ' '.
        //   This turns all ' ' back into '+'.
        sortQuery = sortQuery.split(' ').join('+')

        let sortQueryParts = sortQuery.split(',')

        let sortOptions = {}

        sortQueryParts.map(function(part) {

            if(part.indexOf('-') === 0) {

                let propName = part.substring(1)

                sortOptions[propName] = -1

            } else if (part.indexOf('+') === 0) {

                let propName = part.substring(1)

                sortOptions[propName] = 1

            } else {

                let propName = part

                sortOptions[propName] = 1

            }

        })

        return sortOptions

    },

    getSelectOptions: function(selectQuery) {

        let selectQueryParts = selectQuery.split(',')

        let selectOptions = {}

        selectQueryParts.map(function(part) {

            if(part.indexOf('-') == 0) {

                let propName = part

                selectOptions[propName] = 0

            } else {

                let propName = part

                selectOptions[propName] = 1

            }

        })

        return selectOptions

    },

    getLimitOption: function(limitQuery) {

        try {

            return parseInt(limitQuery)

        } catch (ignore) {

            console.log('invalid limit parameter')
            return -1

        }

    },

    getSkipOption: function(skipQuery) {

        try {

            return parseInt(skipQuery)

        } catch (ignore) {

            console.log('invalid skip parameter')
            return -1

        }

    },

    // "{ "name": "dave", age: 27 }" -> { $set: { name: 5, age: 27 } }
    getSetOptions: function(setQuery) {

        try {

            return JSON.parse(setQuery)

        } catch (ignore) {

            console.log('invalid set parameter')
            return undefined

        }

    },

    // _id,name -> { $unset: { _id: 1, name: 1 } }
    getUnsetOptions: function(unsetQuery) {

        let unsetQueryParts = unsetQuery.split(',')

        let unsetOptions = {}

        unsetQueryParts.map(function(part) {

            unsetOptions[part] = 1

        })

        if(unsetQueryParts.length === 0) {

            return undefined

        } else {

            return unsetOptions

        }

    },

    handleCreateError: function (req, error) {

        let message = `There was a problem adding the new document.`

        if (error.name == 'ValidationError') {

            message = `The 'data' option failed validation.`

            let errorList = Object.keys(error.errors).map(x => error.errors[x])

            let requiredFieldErrors = errorList.filter(x => x.kind == 'required')

            if (requiredFieldErrors.length > 0) {

                let missingRequiredFields =
                    requiredFieldErrors.map(x => x.path)

                message = `Missing required fields: ${missingRequiredFields}`

            } else if(error.errors.name) {

                message = error.errors.name.message

            }

        } else if (error.name == 'MongoError') {

            message = `There was a problem with MongoDB.`

            switch (error.code) {
                case 11000:
                    message = `A document with that key already exists.`
                    break
            }

        }

        req.res = {
            status: 400,
            data: [],
            message: message
        }

    }

}
