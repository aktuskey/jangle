# Jangle
> Your experience matters.

### Overview

Jangle is a CMS focused on providing a simple and intuitive user experience. With Jangle, users create __collections__ of __documents__.


### Local Development

Jangle is currently a work-in-progress, so feel free to contribute to the project!

__Here's how to get started:__

1. Install [Docker](https://docs.docker.com/engine/installation/)

1. Run __`docker-compose up`__


### Project Overview

Jangle uses [Elm](http://elm-lang.org) as it's frontend technology. There's also some [Pug](https://pugjs.org) and a bit of [Sass](http://sass-lang.com/) in there to help out.

The backend is primarily [Typescript]() which runs an [Express](https://expressjs.com/) server. The server exposes a [GraphQL](http://graphql.org) endpoint to allow access to a [MongoDB](https://www.mongodb.com/) instance. Behind the scenes, [PassportJS](http://passportjs.org/) is used to check headers for [JSON Web Tokens](https://jwt.io/) to make sure the user is authenticated.
