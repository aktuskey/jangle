module.exports = {

  constructor: function(name, label, category) {

    return {
      name: name,
      label: label,
      category: category
    };

  },

  validator: {
    '$and': [
      { name: { '$type': 'string' } },
      { label: { '$type': 'string' } },
      { category: { '$type': 'string' } }
    ]
  },

  getInitialValues: function(){
    return [
      // Text
      this.constructor('single-line','Single Line', 'Text'),
      this.constructor('markdown','Markdown', 'Text'),

      // Numbers
      this.constructor('integer','Whole Number', 'Numbers'),
      this.constructor('float', 'Decimal', 'Numbers'),

      // Options
      this.constructor('checkbox', 'Checkbox', 'Options'),
      this.constructor('single-option', 'Single Choice', 'Options'),
      this.constructor('multi-option', 'Multiple Choice', 'Options')

    ];
  },

  uniqueIndexes: { 'name': 1 }

};
