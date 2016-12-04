//  Step 1: Load app dependencies
try {
    var express = require('express'),
        app = express(),
        mongoose = require('mongoose'),
        jwt = require('jsonwebtoken');
} catch (e) {
    console.log(`Please run 'npm install' first.`);
    return;
}

try {
    var config = require('./jangle-config');

    if(config.mongodb == null) {
        config.mongodb = {};
    }
} catch (e) {
    var config = {};
    config.mongodb = {};
}


//  Step 2: Set default values for config
global.config = {

    // For connecting to MongoDB
    mongodb : {
        host: config.mongodb.host || 'localhost',
        port: config.mongodb.port || 27017,
        contentDb: config.mongodb.contentDb || 'jangle',
        liveDb: config.mongodb.liveDb || 'jangleLive',
        auth: config.mongodb.auth || false,
        rootUser: config.mongodb.rootUser || null,
        rootPassword: config.mongodb.rootPassword || null
    }

};

//  Step 3: Set up routes
var webApp = require('./web-app'),
    apiApp = require('./api-app');

app.get('/', webApp);
app.get('/sign-in', webApp);
app.get('/app', webApp);
app.get('/app/*', webApp);

app.get('/api', apiApp);

// API Middleware
app.use('/api/*', require('./api/middleware'));

// Public API
app.get('/api/ping', require('./api/ping.js'));
app.get('/api/auth', require('./api/auth.js'));

// Collections API
app.get('/api/collections', 
    require('./api/collections/get'));
app.post('/api/collections', 
    require('./api/collections/post'));
app.put('/api/collections/:collectionName', 
    require('./api/collections/put'));
app.delete('/api/collections/:collectionName', 
    require('./api/collections/delete'));

// Documents API
app.get('/api/collections/:collectionName', 
    require('./api/documents/get'));
app.post('/api/collections/:collectionName', 
    require('./api/documents/post'));
app.put('/api/collections/:collectionName/:docId', 
    require('./api/documents/put'));
app.delete('/api/collections/:collectionName/:docId', 
    require('./api/documents/delete'));


//  Step 4: Run app
var port = process.env.PORT || 3000;

app.listen(port, function(stuff) {

    console.log(`Jangle ready on port ${port}!`);

});