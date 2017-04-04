let express = require('express')
let app = express()
let session = require('express-session')
let mongoose = require('mongoose')
let bodyParser = require('body-parser')
let passport = require('passport')
let LocalStrategy = require('passport-local').Strategy
let api = require('./api')
let utilities = require('./utilities')
let models = require('./models')
let initials = require('./models/initial')
let userConfig = require('./config/jangle-config')
let config = require('./config/default-config')(userConfig)
let Promise = utilities.Promise(global.Promise)

if (process.env.NODE_ENV !== 'production') {
  try {
    require('dotenv').load()

    app.use((req, res, next) => {
      if (process.env.SET_DELAY) {
        setTimeout(next, parseInt(process.env.SET_DELAY))
      } else {
        next()
      }
    })
  } catch (ignore) { }
}

app.set('port', process.env.PORT || 3000)

// MONGOOSE
mongoose.Promise = Promise

// BODY PARSER
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: false}))

// PUG
app.set('view engine', 'pug')
app.set('views', './public')

// PASSPORT
passport.use(new LocalStrategy(
  (username, password, done) => {
    if (username === config.mongodb.rootUser && password === config.mongodb.rootPassword) {
      done(null, {
        name: {
          first: 'Admin',
          last: 'User'
        },
        username: username,
        token: process.env.ADMIN_TOKEN || 'token'
      })
    } else {
      done(null, false)
    }
  }
))

passport.serializeUser((user, done) => {
  done(null, user.username)
})

passport.deserializeUser((username, done) => {
  if (username === config.mongodb.rootUser) {
    done(null, {
      name: {
        first: 'Admin',
        last: 'User'
      },
      username: username,
      token: process.env.ADMIN_TOKEN || 'token'
    })
  } else {
    done(null, false)
  }
})

app.use(session({
  secret: process.env.COOKIE_SECRET || 'some-cookie-secret',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false }
}))
app.use(passport.initialize())
app.use(passport.session())

// STATIC FILES
app.use(express.static('public'))

// API
app.use('/api', (req, res, next) => {
  req.models = models
  req.config = config
  req.utilities = utilities
  req.Promise = Promise
  req.env = process.env
  req.mongoose = mongoose

  req.res = {
    status: 404,
    message: `Can't ${req.method} at ${req.path}`,
    data: []
  }

  next()
})

app.use('/api', api.routes(api, new express.Router()))

// AUTHENTICATION
app.post('/sign-in', passport.authenticate('local'), (req, res) => {
  res.send(req.user)
})

app.post('/sign-out', (req, res) => {
  let username = req.user ? req.user.username : 'No one'

  req.logout()

  res.status(200).json({
    error: false,
    message: `${username} was signed out.`,
    data: []
  })
})

// WEB APP
app.get('*', (req, res) => {
  if (req.user === undefined) {
    req.user = null
  }

  res.render('index', {
    flags: JSON.stringify({
      user: req.user
    })
  })
})

// START APP
let initializeThen = (onSuccess, onFailure) => {
  utilities.database
    .initializeDatabase({ config, models, utilities, Promise, mongoose, initials })
    .then(onSuccess, onFailure)
}

initializeThen(() => {
  app.listen(app.get('port'), () =>
    console.info(`Jangle ready on port ${app.get('port')}!`)
  )
}, console.error)
