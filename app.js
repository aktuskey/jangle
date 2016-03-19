var express = require('express');
var app = express();

app.use('/static', express.static('dist/static'));
app.use('/templates', express.static('dist/app'));

app.use(function(req, res) {
  res.status(200).sendFile(__dirname+'/dist/index.html');
});

console.log('Listening on port 8080...')
app.listen(8080);