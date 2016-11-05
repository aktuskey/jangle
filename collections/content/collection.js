module.exports = {

  constructor: function(name, label, description, fields, section, order) {

    return {
      name: name,
      label: label,
      description: description,
      fields: fields,
      section: section,
      order: order
    };

  },

  validator: {
    '$and': [
      { 'name': { '$type': 'string' } },
      { 'label': { '$type': 'string' } },
      { 'description': { '$type': 'string' } },
      { 'fields': { '$type': 'array' } },
        { 'fields.label': { '$type': 'string' } },
        { 'fields.optional': { '$type': 'bool' } },
        { 'fields.default': { '$type': 'string' } },
        { 'fields.order': { '$type': 'int' } },
        { 'fields.options': { '$type': 'object' } },
        { 'fields.type': { '$type': 'objectId' } },
      { 'section': { '$type': 'objectId' } },
      { 'order': { '$type': 'int' } }
    ]
  },

  getInitialValues: function(){
    return [];
  },

  uniqueIndexes: { 'name': 1 }

};
