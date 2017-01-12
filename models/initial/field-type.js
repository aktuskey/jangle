let types = {
    String: 'String',
    Number: 'Number',
    Date: 'Date',
    Boolean: 'Boolean',
    Mixed: 'Mixed',
    ObjectId: 'ObjectId',
    Array: 'Array'
};

module.exports = [

    // Single Line
    {
        name: 'single-line',
        label: 'Single Line',
        type: types.String,
        options: {
            'isMarkdown': types.Boolean
        }
    },

    // Multi Line
    {
        name: 'multi-line',
        label: 'Multi Line',
        type: types.String,
        options: {
            'isMarkdown': types.Boolean
        }
    },

    // Whole Number
    {
        name: 'whole-number',
        label: 'Whole Number',
        type: types.Number,
        options: {
            'min': types.Number,
            'max': types.Number
        }
    },

    // Decimal Number
    {
        name: 'decimal-number',
        label: 'Decimal Number',
        type: types.Number,
        options: {
            'min': types.Number,
            'max': types.Number,
            'decimalPlaces': types.Number
        }
    },

    // Checkbox
    {
        name: 'checkbox',
        label: 'Checkbox',
        type: types.Boolean,
        options: {}
    },

    // Single Option
    {
        name: 'single-option',
        label: 'Single Option',
        type: types.ObjectId,
        options: {
            'collection': types.String,
            'displayField': types.String
        }
    },

    // Multi Option
    {
        name: 'multi-option',
        label: 'Multi Option',
        type: types.ObjectId,
        options: {
            'collection': types.String,
            'displayField': types.String,
            'min': types.Number,
            'max': types.Number
        }
    }

];
