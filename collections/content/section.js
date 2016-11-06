module.exports = {

  constructor: function(name, label, order) {

    return {
      name: name,
      label: label,
      order: order
    };

  },

  validator: {
    '$and': [
      { 'name': { '$type': 'string' } },
      { 'label': { '$type': 'string' } },
      { 'order': { '$type': 'int' } }
    ]
  },

  getInitialValues: function(){
    return [
      this.constructor('unsorted','Unsorted',1)
    ];
  },

  uniqueIndexes: { 'name': 1 }

};
