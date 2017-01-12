module.exports = {

    getCollectionModel: function(connection, collectionName) {

        if (connection === undefined) {

            return undefined;

        } else {

            const jangleCollectionName = `jangle.collections`;

            connect

        }

    },


    getSchemaFromCollection: function(collectionFields, fieldTypes) {

        let schemaObject = {};

        for (let i in collectionFields) {

            let field = collectionFields[i];

            schemaObject[field.name] = {

                required: field.required

            };

            if (field.default !== undefined) {
                schemaObject[field.name].default = field.default;
            }

            // type
            let type = fieldTypes.filter((fieldType) => fieldType.name == field.type)[0];

            if (type !== undefined && type.type !== undefined) {
                schemaObject[field.name].type = type.type;
            }

            // Add any schema properties from options
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

            }

        }

        return schemaObject;

    }

};
