# Jangle
> Simple content management.


### API Documentation

__General API__
> For using the Jangle API.

Method | URL | Result
--- | --- | ---
__`GET`__ |`/auth`| Used to retrieve an authentication `token` for all other api requests.
__`GET`__ |`/api`| Jangle API documentation.


__Collections API__
> For managing content.

Method | URL | Result
--- | --- | ---
__`GET`__ |`/api/collections`| List collections.
__`POST`__ |`/api/collections`| Create a new collection.
__`PUT`__ |`/api/collections/some-example`| Update `some-example` collection.
__`DELETE`__ |`/api/collections/some-example`| Delete `some-example` collection.
| |
__`GET`__ |`/api/collections/some-example`| List documents in `some-example` collection.
__`POST`__ |`/api/collections/some-example`| Create a new document in `some-example` collection.
__`PUT`__ |`/api/collections/some-example/123`| Update document `123` from `some-example` collection.
__`DELETE`__ |`/api/collections/some-example/123`| Delete document `123` from `some-example` collection.

Method | Parameter | Description
--- | --- | ---
__`GET`__ | `filter` | Filters down listed results.
          | `select` | Select properties to return.
          | `sort` | Sort by a property.
          | `limit` | Limit number of returned results.
          | `skip` | Skip a certain number of results.
__`POST`__ | `data` | Object to create.
__`PUT`__ | `data` | Object containing fields to update.


### Jangle Meta Collections

__What are 'Meta Collections'?__

In addition to storing your content in collections, Jangle creates a couple "meta collections" that maintain information about your Jangle configuration. For example, the `jangle.collections` meta collection keeps track of all of your collection information (the name, the fields, etc). It is Jangle's responsibility to maintain a relationship with the MongoDB instance to ensure that these collections reflect the true state of your content.

__Meta Collections__
> A list of Jangle's meta collections.

Name | Field | Description
--- | --- | ---
__`jangle.collections`__ | `name` | The actual name of the Mongo collection
                         | `labels.singular` | The singular display name
                         | `labels.plural` | The plural display name
                         | `fields` | An array of collection fields
                         | `fields[i].name` | Property name of document
                         | `fields[i].label` | Display name
                         | `fields[i].name` | Actual name of fieldTrevor Noah
