var express = require('express'),
	app = express(),
	mongoose = require('mongoose'),
	bodyParser = require('body-parser'),
	api = require('./api'),
	utilities = require('./utilities'),
	models = require('./models'),
	initials = require('./models/initial'),
	userConfig = require('./jangle-config'),
	config = require('./default-config')(userConfig)
 	promise = utilities.promise(global.Promise)

mongoose.Promise = promise

app.use(bodyParser.json())

app.use((req, res, next) => {

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
