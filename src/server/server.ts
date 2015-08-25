/// <reference path='./typings/tsd.d.ts' />


import express = require('express');
import http = require('http');
import path = require('path');
import socketio = require('socket.io');

import Sync = require('./SyncNodeServer');

var app = express();
var server = http.createServer(app);

var io = socketio(server);


var defaultRec = {
    lastModified: new Date().toISOString(),
    name: 'New Rec',
    tickets: {
        '0': { key: '0', name: 'Justin2', items: {} }
    },
    menu: {
        categories: {
            '0': {
                key: '0',
                name: 'Dinner Entrees',
                items: {
                    '0': { key: '0', name: '14oz Ribeye', price: '20' }
                }
            }
        }
    }
};


var ReconciliationServer = new Sync.SyncNodeServer('reconciliation', io, defaultRec);



var defaultDiagrams = {
    lastModified: new Date().toISOString(),
    diagrams: {
        '1': {
            key: '1',
            lastModified: new Date().toISOString(),
            name: 'New Flow 1',
            items: {}
        }
    }
};

var FlowDiagramsServer = new Sync.SyncNodeServer('flowdiagrams', io, defaultDiagrams);



app.use('/', (req: any, res: any, next: any) => {
    if (req.url === '/') {
        res.writeHead('content-type', 'text/plain')
        res.write('<!DOCTYPE html>');
        res.write('<html lang="en">');
        res.write('  <head>');
        res.write('    <title>RMS</title>');
        res.write('    <meta name="viewport" content="user-scalable=no, width=device-width, initial-scale=1, maximum-scale=1">');
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
