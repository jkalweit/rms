/// <reference path='./typings/tsd.d.ts' />
var express = require('express');
var http = require('http');
var path = require('path');
var bodyParser = require('body-parser');
var socketio = require('socket.io');
var Sync = require('./SyncNodeServer');
var app = express();
var server = http.createServer(app);
app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
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
var defaultKitchen = {
    lastModified: new Date().toISOString(),
    orders: {}
};
var KitchenServer = new Sync.SyncNodeServer('kitchen', io, defaultKitchen);
app.use('/api/kitchen/orders', function (req, res, next) {
    var order = req.body;
    console.log('Adding Order: ', order);
    var merge = { orders: {} };
    merge.orders[order.key] = order;
    KitchenServer.doMerge(KitchenServer.data, merge);
    KitchenServer.persist();
    KitchenServer.ioNamespace.emit('update', merge);
    res.end('Ok');
});
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
app.use('/', function (req, res, next) {
    if (req.url === '/') {
        res.writeHead('content-type', 'text/plain');
        res.write('<!DOCTYPE html>');
        res.write('<html lang="en">');
        res.write('  <head>');
        res.write('    <title>RMS</title>');
        res.write('    <meta name="viewport" content="user-scalable=no, width=device-width, initial-scale=1, maximum-scale=1">');
        res.write('    <link rel="stylesheet" href="/bower_components/font-awesome/css/font-awesome.css" />');
        res.write('    <link rel="stylesheet" type="text/css" href="/styles/site.css" />');
        res.write('  </head>');
        res.write('  <body>');
        res.write('    <script src="/bower_components/moment/moment.js" data-main="scripts/App.js"></script>');
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
server.listen(port, function () {
    console.log('Express is listening on %s:%s', server.address().address, server.address().port);
});
//# sourceMappingURL=Server.js.map