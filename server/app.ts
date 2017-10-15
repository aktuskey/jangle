import { makeExecutableSchema } from 'graphql-tools'
import { graphqlExpress, graphiqlExpress } from 'apollo-server-express'
import * as express from 'express'
import * as bodyParser from 'body-parser'
import * as path from 'path'

import { typeDefs, resolvers } from './graphql'
import { setupAuthentication } from './authentication'

const port = process.env.PORT || 3000
const graphQLOptions = { schema: makeExecutableSchema({ typeDefs, resolvers }) }

const app = express()
const auth = setupAuthentication(app)

// Express Middleware
app.use(bodyParser.json())
app.set('views', path.join(__dirname, 'public'))
app.set('view engine', 'pug')

// Authentication API
app.post('/api/sign-in', auth.signIn)
app.use('/api', (_req, res) => res.json({ error: true, message: 'Endpoint does not exist', data: [] }))

// (Soon to be Authenticated) GraphQL API
app.use('/graphql', graphqlExpress(graphQLOptions))
app.use('/graphiql', graphiqlExpress({ endpointURL: '/graphql' }))

// Web application
app.use('/public', express.static(path.join(__dirname, 'public')))
app.use((req, res) => {
  const locals = {
    basedir: path.join(__dirname, 'public'),
    pretty: true,
    flags: JSON.stringify({
      user: req.user || null
    } || {})
  }

  res.render('index', locals)
})

app.listen(port, () => console.info(`Ready at http://localhost:${port}`))
