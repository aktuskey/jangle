# Jangle

> Simple content management.



### API Documentation



__Public API__
> These routes don't require an authentication token.

 | URL | Result
--- | --- | ---
__`GET`__ |`/api/ping`| Tests connection to Jangle.
__`GET`__ |`/api/auth`| Used to retrieve an authentication `token` for all other api requests.


__Collections API__
> These routes require an authenticated user.

__`GET`__:

URL | Result
--- | ---
 `/api/collections/puppies`| Lists all documents in `puppies` collection.
`/api/collections/puppies/123`| Gets document '123' in `puppies` collection.

Parameter | Description
--- | ---
`where` | Filters down listed results.
`select` | Selects properties to return.
`sort` | Sorts by a property.
`limit` | Limits number of returned results.
`skip` | Skips a certain number of results.


__`POST`__:

 URL | Result
--- | ---
`/api/collections/puppies`| Creates new documents in `puppies` collection.

Parameter | Description
--- | ---
`documents` | Specifies new documents to add.


__`PUT`__:

URL | Result
--- | ---
`/api/collections/puppies`| Updates documents in `puppies` collection.
`/api/collections/puppies/123`| Updates document `123` from `puppies` collection.

Parameter | Description
--- | ---
`where` | Filters down documents to update.
`set` | Specifies fields to update.
`unset` | Specifies fields to remove.


__`DELETE`__:

URL | Result
--- | ---
`/api/collections/puppies`| Removes documents in `puppies` collection.
`/api/collections/puppies/123`| Removes document `123` from `puppies` collection.

Parameter | Description
--- | ---
`where` | Filters down documents to remove.

---


### Jangle Meta

__What is ' Jangle Meta'?__

In addition to storing your content in collections, Jangle creates a couple "meta collections" that maintain information about your Jangle configuration.

To maintain information for documents, all documents have jangle "meta properties". For example, `jangle.version` will allow the system to track changes for a specific document.

__Meta Collections__
> A list of Jangle's meta collections.

Name | Field | Description
--- | --- | ---
__`jangle.collections`__ | `name` | The actual name of the Mongo collection
                         | `labels.singular` | The singular display name
                         | `labels.plural` | The plural display name
                         | `fields` | An array of collection fields
                         | `fields[i].name` | Property name of the document
                         | `fields[i].label` | Display name
                         | `fields[i].type` | Related [FieldType]
                         | `fields[i].required` | True if the field is required
                         | `fields[i].default` | Default value for that field
                         | `fields[i].exampleValue` | Example value for content admins
                         | `fields[i].options` | FieldType related options
                         | |
__`jangle.fieldTypes`__ | `name` | unique name of field type
                        | `label` | display name
                        | `options` | settings for field type
                        | `type` | data type to store in mongo
                        | |

__Meta Document Properties__
> Properties on all collection and singleton documents.

Property | Description
--- | ---
__`jangle.id`__ | Used to uniquely identify an document (across versions)
__`jangle.version`__ | The version of the document
__`jangle.published`__ | Is this version anonymously visible?

---


# Field Types

Jangle comes with a few simple data types for content management. The goal is to avoid using words like 'String' and 'Integer', and use more obvious names like 'Single Line Text' and 'Whole Number'.

__Single Line Text__
> Just a single row of text input.

__`options`__

`type` - is this a `phone`, `email`, or just a simple `text` field?

`isMarkdown` - can content admins add style to the text?


__Multi Line Text__
> Multiple rows of text input.

__`options`__

`isMarkdown` - can content admins add style to the text?


__Whole Number__
> A whole number can't have decimals or fractions (-1, 0, 1, 2, 3, ...).

__`options`__

`min` - lowest possible numeric value.

`max` - highest possible numeric value.


__Decimal Number__
> A decimal number can have decimals or fractions (-1.23, 0, 1.56, 2, 3, ...).

__`options`__

`min` - lowest possible numeric value.

`max` - highest possible numeric value.

`decimalPlaces` - set number of decimal places.


__Checkbox__
> Represents a true/false option.

__`options`__

(none)


__Single Option__
> Choose a single document from another collection.

__`options`__

`collection` - collection relating this option to.

`displayField` - other collections field to see in UI.


__Multi Option__
> Choose many documents from another collection.

__`options`__

`collection` - collection relating this option to.

`displayField` - other collections field to see in UI.
