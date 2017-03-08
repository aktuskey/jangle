var express = require('express'),
	session = require('express-session'),
	app = express(),
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

mongoose.Promise = promise

passport.use(new LocalStrategy(

  function(username, password, done) {

	  if ( username === config.rootUser && password === config.rootPassword ) {

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

));

app.use(bodyParser.json())
app.use(session({
	secret: process.env.COOKIE_SECRET || 'some-cookie-secret',
	resave: false,
	saveUninitialized: true,
	cookie: { secure: true }
}));
app.use(passport.initialize());
app.use(passport.session());

// Static files
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

// WEB APP
app.post('/sign-in', passport.authenticate('local', {
	successRedirect: '/dashboard',
    failureRedirect: '/sign-in'
}))

app.get('*', (req, res) => {
	res.sendFile( __dirname + '/public/index.html' )
})

app.set('port', process.env.PORT || 3000)

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
