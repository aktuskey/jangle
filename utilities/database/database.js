module.exports = {

  initializeDatabase: ({ config, models, utilities, Promise, mongoose, initials }) => {
    return new Promise((resolve, reject) => {
      let req = { Promise, utilities, config, mongoose }

      utilities.database
        .getMongoConnection(req)()
        .then(() => {
          let Models = Object
            .keys(models)
            .map((key) => {
              return {
                initial: initials[key] || [],
                model: models[key]
              }
            })
          let count = Models.length
          let modelsProcessed = 0
          let modelsInitialized = 0

          let modelProcessed = () => {
            modelsProcessed++

            if (modelsProcessed === count) {
              let units = modelsInitialized === 1
                ? 'collection'
                : 'collections'

              console.log(`    ${modelsInitialized} ${units} initialized.\n`)

              req.connection.close(resolve)
            }
          }

          Models.map(({ model, initial }) => {
            let Model = req.connection.model(model.modelName, model.schema)

            if (Model !== undefined && initial.length > 0) {
              Model.on('index', () => {
                Model.create(initial, function (error, results) {
                  if (!error && results !== undefined) {
                    console.info(`Initializing ${model.modelName}...`)
                    modelsInitialized++
                  }
                  modelProcessed()
                })
              })
            } else {
              modelProcessed()
            }
          })
        })
        .catch(reject)
    })
  },

  getMongoConnection: function (req) {
    return function () {
      return new req.Promise(function (resolve, reject) {
        let connectionString =
          req.utilities.database.getConnectionString(req.config)

        req.connection = req.mongoose.createConnection()

        req.connection.open(connectionString, function (error) {
          if (error) {
            req.utilities.logging.handleConnectionError(req, reject)
          } else {
            resolve()
          }
        }).catch(() =>
          req.utilities.logging.handleConnectionError(req, reject)
        )
      })
    }
  },

  getConnectionString: (config) => {
    let authPrefix = (config.mongodb.auth)
      ? `${config.mongodb.rootUser}:${config.mongodb.rootPassword}@`
      : ''
    let host = config.mongodb.host
    let port = config.mongodb.port
    let database = config.mongodb.database

    return `mongodb://${authPrefix}${host}:${port}/${database}`
  },

  getModel: function (req, collectionName, onSuccess, onFailure) {
    let metaPrefix = req.config.mongodb.metaPrefix
    let isMetaCollection = collectionName.indexOf(metaPrefix) === 0

    if (isMetaCollection) {
      let metaCollectionName = collectionName.substring(metaPrefix.length)

      switch (metaCollectionName) {
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
      let collectionModel = req.models.collection
      let Collection = req.connection.model(
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

  createFieldTypes: function (models, connection) {
    let initialFieldTypes = models.initial.fieldType
    let FieldTypesModel =
      connection.model(
        models.fieldType.modelName,
        models.fieldType.schema
      )

    return new Promise((resolve, reject) => {
      FieldTypesModel.create(
        initialFieldTypes,
        function (error, fieldTypes) {
          if (error || fieldTypes === undefined) {
            reject(error)
          } else {
            resolve(fieldTypes)
          }
        }
      )
    })
  },

  getSchemaFromCollection: function (collectionFields, fieldTypes) {
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
      let matchingFieldTypes = fieldTypes.filter((fieldType) =>
        fieldType.name === field.type
      )
      let matchingFieldType = matchingFieldTypes[0]

      if (matchingFieldType !== undefined && matchingFieldType.type !== undefined) {
        schemaObject[field.name].type = matchingFieldType.type
      }
/*
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
      }
*/
    }
    return schemaObject
  },

  getQueryOptions: function (req) {
    let queryOptions = {}

    // TODO: Better WHERE (gt, lt, eq, ne, contains, etc.)
    if (req.query.where !== undefined) {
      queryOptions.where = this.getWhereOptions(req.query.where)
    } else {
      queryOptions.where = {}
    }

    if (req.params.docId !== undefined) {
      let idField = req.idField || '_id'
      queryOptions.where[idField] = req.params.docId
    }

    if (req.query.set !== undefined) {
      let set = this.getSetOptions(req.query.set)

      if (set !== undefined) {
        queryOptions.set = set
      }
    }

    // UNSET
    if (req.query.unset !== undefined) {
      let unset = this.getUnsetOptions(req.query.unset)

      if (unset !== undefined) {
        queryOptions.unset = unset
      }
    }

    // SORT
    if (req.query.sort !== undefined) {
      queryOptions.sort = this.getSortOptions(req.query.sort)
    }

    // SELECT
    if (req.query.select !== undefined) {
      queryOptions.select = this.getSelectOptions(req.query.select)
    }

    // LIMIT
    if (req.query.limit !== undefined) {
      queryOptions.limit = this.getLimitOption(req.query.limit)
    }

    // SKIP
    if (req.query.skip !== undefined) {
      queryOptions.skip = this.getSkipOption(req.query.skip)
    }

    // TODO: POPULATE
    if (req.query.populate !== undefined) { }

    return queryOptions
  },

  getWhereOptions: function (whereQuery) {
    try {
      return JSON.parse(whereQuery)
    } catch (ignore) {
      console.info('Could not parse where query.')
      return {}
    }
  },

  // "-name,age,+created" -> { 'name': -1, 'age': 1, 'created': 1 }
  getSortOptions: function (sortQuery) {
    // Weirdness: '+' is replaced with ' '.
    //   This turns all ' ' back into '+'.
    sortQuery = sortQuery.split(' ').join('+')

    let sortQueryParts = sortQuery.split(',')
    let sortOptions = {}

    sortQueryParts.map(function (part) {
      if (part.indexOf('-') === 0) {
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

  getSelectOptions: function (selectQuery) {
    let selectQueryParts = selectQuery.split(',')
    let selectOptions = {}

    selectQueryParts.map(function (part) {
      if (part.indexOf('-') === 0) {
        let propName = part
        selectOptions[propName] = 0
      } else {
        let propName = part
        selectOptions[propName] = 1
      }
    })

    return selectOptions
  },

  getLimitOption: function (limitQuery) {
    try {
      return parseInt(limitQuery)
    } catch (ignore) {
      console.info('invalid limit parameter')
      return -1
    }
  },

  getSkipOption: function (skipQuery) {
    try {
      return parseInt(skipQuery)
    } catch (ignore) {
      console.info('invalid skip parameter')
      return -1
    }
  },

  // '{ "name": "dave", "age": 27 }' -> { name: 5, age: 27 }
  getSetOptions: function (setQuery) {
    try {
      return JSON.parse(setQuery)
    } catch (ignore) {
      console.info('invalid set parameter')
      return undefined
    }
  },

  // _id,name -> { $unset: { _id: 1, name: 1 } }
  getUnsetOptions: function (unsetQuery) {
    let unsetQueryParts = unsetQuery.split(',')
    let unsetOptions = {}

    unsetQueryParts.map(function (part) {
      unsetOptions[part.trim()] = 1
    })

    if (unsetQueryParts.length === 0) {
      return undefined
    } else {
      return unsetOptions
    }
  },

  getDeltas: function (documents, set, unset) {
    let setFields = set === undefined ? [] : Object.keys(set)
    let unsetFields = unset === undefined ? [] : Object.keys(unset)

    if (setFields.length === 0 && unsetFields.length === 0) {
      return []
    }

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

        return obj
      }
    }

    let mapFields = (document, deltaDocument) => {
      return (field) => {
        //  field:               props:
        // 'labels.singular' -> ['labels', 'singular']
        let props = field.split('.')
        let currentValue = document
        let firstProp = props[0]

        for (let i in props) {
          let prop = props[i]
          currentValue = currentValue[prop]
        }

        props.shift()

        deltaDocument[firstProp] = fancyShit(props, currentValue)
      }
    }

    let deltaDocuments = documents.map((document) => {
      let deltaDocument = {}

      setFields.map(mapFields(document, deltaDocument))

      unsetFields.map(mapFields(document, deltaDocument))

      return deltaDocument
    })

    return deltaDocuments
  }

}
