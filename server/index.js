'use strict';

var express = require('express');
var http = require('http');
var https = require('https');
var fs = require('fs');
var path = require('path');
var api = require('./api.js');

var app = express();
var port = process.env.port || process.env.PORT || 8443;
var development = process.env.NODE_ENV !== 'production';
var server = null;
var serverCreated = function () {
  console.log('Server listening on port %d...', server.address().port);
};

if (development) {
  server = https.createServer({
    key: fs.readFileSync(process.env.SERVER_KEY_FILE || 'server.key'),
    cert: fs.readFileSync(process.env.SERVER_CERT_FILE || 'server.crt')
  }, app).listen(port, serverCreated);
} else {
  server = http.createServer(app).listen(port, serverCreated);
}

app.use('/', express.static(path.join(__dirname, '../')));
app.use('/api', api);
