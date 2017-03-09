var express = require('express'),
	app = express(),
	session = require('express-session'),
	mongoose = require('mongoose'),
	bodyParser = require('body-parser'),
	passport = require('passport'),
	LocalStrategy = require('passport-local').Strategy,
	api = require('./api'),
	utilities = require('./utilities'),
	models = require('./models'),
	initials = require('./models/initial'),
	userConfig = require('./jangle-config'),
	config = require('./default-config')(userConfig)
 	promise = utilities.promise(global.Promise)

app.set('port', process.env.PORT || 3000)


// MONGOOSE
mongoose.Promise = promise


// BODY PARSER
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: false}))


// PUG
app.set('view engine', 'pug')
app.set('views', './public')


// PASSPORT
passport.use(new LocalStrategy(

  function(username, password, done) {

	  if ( username === config.mongodb.rootUser && password === config.mongodb.rootPassword ) {

		  done(null, {
			  name: {
				  first: 'Admin',
				  last: 'User'
			  },
			  username: username
		  })

	  } else {

		  done(null, false)

	  }
  }

))

passport.serializeUser(function(user, done) {
  done(null, user.username)
})

passport.deserializeUser(function(username, done) {
  if (username === config.mongodb.rootUser) {
	  done(null, {
		  name: {
			  first: 'Admin',
			  last: 'User'
		  },
		  username: username
	  })
  } else done(null, false)
})

app.use(session({
	secret: process.env.COOKIE_SECRET || 'some-cookie-secret',
	resave: false,
	saveUninitialized: true,
	cookie: { secure: false }
}))
app.use(passport.initialize());
app.use(passport.session());


// STATIC FILES
app.use(express.static('public'))


// API
app.use('/api', (req, res, next) => {

	req.models = models
	req.config = config
	req.utilities = utilities

	req.promise = promise
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


// WEB APP
app.get('*', (req, res) => {

	if (req.user === undefined)
		req.user = null

	res.render('index', {
		flags: JSON.stringify({
			user: req.user
		})
	})
})


// START APP
let initializeThen = function (onSuccess, onFailure) {

	utilities.database
		.initializeDatabase({ config, models, utilities, promise, mongoose, initials })
		.then(onSuccess, onFailure)

}

initializeThen(() => {

	app.listen(app.get('port'), () =>
		console.info(`Jangle ready on port ${app.get('port')}!`)
	)

}, console.error)
