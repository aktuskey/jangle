var express = require('express');
var app = express();
var router = express.Router();
var dotenv = require('dotenv');

// Load environment variables from .env file
if(process.env.NODE_ENV != 'production')
  dotenv.load();

// Static Files
app.use('/static', express.static('dist/static'));
app.use('/node_modules', express.static('node_modules'));
app.use('/templates', express.static('dist/app'));

// API
var api = require('./api')(router);
app.use('/api', router);

// Web Application
app.use(function(req, res) {
  console.log(req.url);
  if(req.url.substr(0,'/templates'.length) == '/templates')
  	res.status(500);
  else
  	res.status(200).sendFile(__dirname+'/dist/index.html');
});

//  Start the server
if (module === require.main) {
    var server = app.listen(process.env.PORT || 8080, function () {
    var host = server.address().address;
    var port = server.address().port;

    host = (host == '::') ? 'localhost' : host;

    console.log('App listening at http://%s:%s', host, port);
  });
}

module.exports = app;