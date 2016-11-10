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
__`POST`__ |`/api/collections`| Create a new document in `some-example` collection.
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


___User API___
> For managing users. (This is a work in progress)

Method | URL | Result
--- | --- | ---
| |
