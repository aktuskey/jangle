global.include = (path) => require(`${__dirname}/${path}`);

// Make sure all dependencies are available
try {

	var express = require('express'),
		app = express(),
		mongoose = require('mongoose');

	if (process.env.NODE_ENV != 'production') {

		var cors = require('cors');
		app.use(cors());

	}

	mongoose.Promise = global.Promise;

} catch (ignore) {

	console.log(`Please run 'npm install' first.`);
	return;

}

// Set up routes
var webApp = require('./web-app'),
	api = require('./api');

// Frontend Web Application
app.use('/static', express.static('web-app/static'));

app.get('/', webApp);
app.get('/sign-in', webApp);
app.get('/dashboard', webApp);
app.get('/collections', webApp);
app.get('/collections/:collectionName', webApp);

// API
app.use('/api/*', (req, res, next) => {

	req.mongoose = mongoose;
	req.helpers = require('./helpers');
	req.jangleConfig = require('./default-config.js');
	req.done = require('./api/middleware/all/after');

	next();

});

app.use('/api/*', api.middleware.all.before);

// Public API
app.get('/api/ping', api.public.ping);
app.get('/api/auth', api.public.auth);

// Meta Collections Middleware
// (/api/jangle/abc --> /api/collections/jangle.abc)
// (/api/jangle/abc/def --> /api/collections/jangle.abc/def)
app.all('/api/jangle/:metaCollectionName',
	api.middleware.meta.before);
app.all('/api/jangle/:metaCollectionName/:metaCollectionId',
	api.middleware.meta.before);

// Collections API
app.get('/api/collections/:collectionName',
	api.collections.get.many);
app.get('/api/collections/:collectionName/:docId',
	api.collections.get.many);
//
app.post('/api/collections/:collectionName',
	api.collections.post.one);
//
// app.put('/api/collections/:collectionName',
// 	api.collections.put.many);
// app.put('/api/collections/:collectionName/:docId',
// 	api.collections.put.one);
//
// app.delete('/api/collections/:collectionName',
// 	api.collections.delete.many);
// app.delete('/api/collections/:collectionName/:docId',
// 	api.collections.delete.one);

// API Cleanup
app.use('/api/*', api.middleware.all.after);


var port = process.env.PORT || 3000;

app.listen(port, function() {

	console.log(`Jangle ready on port ${port}!`);

});
