/// <reference path='./typings/tsd.d.ts' />


import express = require('express');
import http = require('http');
import path = require('path');
import socketio = require('socket.io');



var app = express();
var server = http.createServer(app);



var io = socketio(server);



var reconciliation = {
  lastModified: new Date().toISOString(),
  name: 'Test Rec'
};


var namespace = io.of('/reconciliation');
namespace.on('connection', (socket) => {
    console.log('someone connected to reconciliation');
    socket.on('getLatestRec', (comparisonDate: Date) => {
        console.log('getLatestRec', comparisonDate);
        socket.emit('getLatestRecResponse', JSON.stringify(reconciliation));
    });
});


app.use('/', (req: any, res: any, next: any) => {
    if(req.url === '/') {
      res.writeHead('content-type','text/plain')
      res.write('<!DOCTYPE html>');
      res.write('<html lang="en">');
      res.write('  <head>');
      res.write('    <title>RMS</title>');
      res.write('    <link rel="stylesheet" href="/bower_components/font-awesome/css/font-awesome.css" />');
      res.write('    <link rel="stylesheet" type="text/css" href="/styles/site.css" />');
      res.write('  </head>');
      res.write('  <body>');
      res.write('    <script src="/bower_components/requirejs/require.js" data-main="scripts/App.js"></script>');
      res.write('  </body>');
      res.write('</html>');
      res.end();
    }
    next();
  });


app.use('/bower_components', express.static(path.join(__dirname, '../../bower_components')));
app.use('/', express.static(path.join(__dirname, '../client/')));



var port = process.env.PORT || 1337;
server.listen(port, function() {
    console.log('Express is listening on %s:%s', server.address().address, server.address().port);
});
