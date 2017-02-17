var express = require('express'),
	app = express(),
	mongoose = require('mongoose'),
	bodyParser = require('body-parser'),
	api = require('./api'),
	promise = require('./helpers/promise')

mongoose.Promise = promise

app.use(bodyParser.json())
app.use('/api', api.routes(api, app.Router()))

app.set('port', process.env.PORT || 3000)

app.listen(app.get('port'), () =>
	console.info(`Jangle ready on port ${app.get('port')}!`)
)
