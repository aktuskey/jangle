global.include = (path) => require(`${__dirname}/${path}`);

try {

    var express = require('express'),
        app = express(),
        mongoose = require('mongoose');

    mongoose.Promise = global.Promise;

} catch (ignore) {

    console.log(`Please run 'npm install' first.`);
    return;

}

var webApp = require('./web-app'),
    api = require('./api');

// Web app
app.get('/', webApp);
app.get('/sign-in', webApp);
app.get('/app', webApp);
app.get('/app/*', webApp);

// API Before
app.use('/api/*', api.middleware.all.before);

// Public API
app.get('/api/ping', api.public.ping);
app.get('/api/auth', api.public.auth);

// Meta Collections Middleware
app.get('/api/jangle/:metaCollectionName', api.middleware.meta.before);
app.get('/api/jangle/:metaCollectionName/:metaCollectionId', api.middleware.meta.before);

app.post('/api/jangle/:metaCollectionName', api.middleware.meta.before);

app.put('/api/jangle/:metaCollectionName', api.middleware.meta.before);
app.put('/api/jangle/:metaCollectionName/:metaCollectionId', api.middleware.meta.before);

app.delete('/api/jangle/:metaCollectionName', api.middleware.meta.before);
app.delete('/api/jangle/:metaCollectionName/:metaCollectionId', api.middleware.meta.before);

// Collections API
app.get('/api/collections/:collectionName', api.collections.get);
app.get('/api/collections/:collectionName/:docId', api.collections.get);

app.post('/api/collections/:collectionName', api.collections.post);

app.put('/api/collections/:collectionName', api.collections.put);
app.put('/api/collections/:collectionName/:docId', api.collections.put);

app.delete('/api/collections/:collectionName', api.collections.delete);
app.delete('/api/collections/:collectionName/:docId', api.collections.delete);

// API Cleanup
app.use('/api/*', api.middleware.all.after);


var port = process.env.PORT || 3000;

app.listen(port, function () {
    'use strict';

    console.log(`Jangle ready on port ${port}!`);

});