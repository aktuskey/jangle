# Jangle

> Simple content management.


---

### API Documentation

__Public API__
> These routes don't require an authentication token.

Method | URL | Result
--- | --- | ---
__`GET`__ |`/api`| Jangle API documentation.
__`GET`__ |`/api/auth`| Used to retrieve an authentication `token` for all other api requests.
__`GET`__ |`/api/collections/some-example`| List __published__ documents in `some-example` collection.


__Collections API__
> For managing content.

Method | URL | Result
--- | --- | ---
__`GET`__ |`/api/collections/some-example`| List documents in `some-example` collection.
__`GET`__ |`/api/collections/some-example/123`| Get document '123' in `some-example` collection.
__`POST`__ |`/api/collections/some-example`| Create a new document in `some-example` collection.
 | |
__`PUT`__ |`/api/collections/some-example`| Update documents in `some-example` collection.
__`PUT`__ |`/api/collections/some-example/123`| Update document `123` from `some-example` collection.
__`DELETE`__ |`/api/collections/some-example`| Remove documents in `some-example` collection.
__`DELETE`__ |`/api/collections/some-example/123`| Remove document `123` from `some-example` collection.

Method | Parameter | Description
--- | --- | ---
__`GET`__ | `where` | Filters down listed results.
          | `select` | Select properties to return.
          | `sort` | Sort by a property.
          | `limit` | Limit number of returned results.
          | `skip` | Skip a certain number of results.
 | |
__`POST`__ | `data` | Object to create.
 | |
__`PUT`__ | `set` | Select fields to update.
          | `unset` | Select fields to remove.
          | `where` | Filters down documents to update.
 | |
__`DELETE`__ | `where` | Filters down documents to remove.

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
