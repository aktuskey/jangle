module.exports = {

    getConnectionString: (config) => {

        let authPrefix = (config.mongodb.auth)
            ? `${config.mongodb.rootUser}:${config.mongodb.rootPassword}@`
            : ''

        return `mongodb://${authPrefix + config.mongodb.host}:${config.mongodb.port}/${config.mongodb.database}`

    },

    getModel: function(req, collectionName, onSuccess, onFailure) {

        let metaPrefix = req.config.mongodb.metaPrefix,
            isMetaCollection = collectionName.indexOf(metaPrefix) === 0

        if (isMetaCollection) {

            let metaCollectionName = collectionName.substring(metaPrefix.length)

            switch (metaCollectionName)
            {
                case 'collections':
                    onSuccess(req.models.collection)
                    break
                case 'field-types':
                    onSuccess(req.models.fieldTypes)
                    break
                default:
                    onFailure(`Could not find meta collection '${collectionName}'.`)
                    break
            }

        } else {

            let collectionModel = req.models.collection,
                Collection = req.connection.model(
                    collectionModel.name,
                    collectionModel.schema
                )

            Collection
                .find({ name: collectionName })
                .exec(function (err, collections) {

                    if (err || collections.length === 0) {

                        onFailure(`Could not find collection '${collectionName}'.`)

                    } else {

                        onSuccess(collections[0])

                    }

                })

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
            let matchingFieldTypes = fieldTypes.filter( (fieldType) =>
                    fieldType.name == field.type
                ),
                matchingFieldType = matchingFieldTypes[0]

            if (matchingFieldType !== undefined && matchingFieldType.type !== undefined) {
                schemaObject[field.name].type = matchingFieldType.type
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

    // '{ "name": "dave", "age": 27 }' -> { name: 5, age: 27 }
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

            unsetOptions[part.trim()] = 1

        })

        if(unsetQueryParts.length === 0) {

            return undefined

        } else {

            return unsetOptions

        }

    },

    getDeltas: function (documents, set, unset) {

        let setFields = set === undefined ? [] : Object.keys(set),
            unsetFields = unset === undefined ? [] : Object.keys(unset)

        if (setFields.length === 0 && unsetFields.length === 0)
            return []

        let fancyShit = (props, currentValue) => {

            let obj = {}

            if (props.length === 0) {

                return currentValue

            } else if (props.length === 1) {

                obj[props[0]] = currentValue

                return obj

            } else {

                let nextProp = props.shift()

                obj[nextProp] = fancyShit(props, currentValue)

                return obj;

            }

        }

        let mapFields = (document, deltaDocument) => {

            return (field) => {

                //  field:               props:
                // 'labels.singular' -> ['labels', 'singular']
                let props = field.split('.'),
                    currentValue = document,
                    firstProp = props[0]

                for(let i in props) {

                    let prop = props[i]

                    currentValue = currentValue[prop]

                }

                props.shift()

                deltaDocument[firstProp] = fancyShit(props, currentValue)

            }

        }

        let deltaDocuments = documents.map( (document) => {

            var deltaDocument = {}

            setFields.map(mapFields(document, deltaDocument))

            unsetFields.map(mapFields(document, deltaDocument))

            return deltaDocument

        })

        return deltaDocuments

    },

    getCreateErrorMessage: function (error) {

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

        return message

    }

}
