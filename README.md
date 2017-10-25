# Jangle
> Make content management embarrassingly simple.

![alt text](https://raw.githubusercontent.com/RyanNHG/jangle/master/screenshots/users-desktop.png "Jangle Screenshot")

### Local Development

Jangle is currently a work-in-progress, so feel free to contribute to the project!

__Here's how to get started:__

1. Install [Docker](https://docs.docker.com/engine/installation/)

1. Run __`docker-compose up`__


### Project Overview

Jangle uses [Elm](http://elm-lang.org) as it's frontend technology. There's also some [Pug](https://pugjs.org) and a bit of [Sass](http://sass-lang.com/) in there to help out.

The backend is primarily [Typescript]() which runs an [Express](https://expressjs.com/) server. The server exposes a [GraphQL](http://graphql.org) endpoint to allow access to a [MongoDB](https://www.mongodb.com/) instance. Behind the scenes, [PassportJS](http://passportjs.org/) is used to check headers for [JSON Web Tokens](https://jwt.io/) to make sure the user is authenticated.


### Roadmap

- [x] Create initial user on welcome screen
- [x] Sign in / sign out with username/password
- [x] Users
  - [x] View
  - [x] Add
  - [x] Edit
  - [x] Remove
- [ ] Collections
  - [ ] View
  - [ ] Add
  - [ ] Edit
  - [ ] Remove
- [ ] Documents
  - [ ] View
  - [ ] Add
  - [ ] Edit
  - [ ] Remove
- [ ] Export collection model to JSON
- [ ] Import collection model on new instance
- [ ] Undo changes on collections / documents
