/// <reference path='./typings/tsd.d.ts' />

import express = require('express');
import Mongo = require('mongodb');
import socketio = require('socket.io');

import db = require('./db');
import models = require('./app/models');


var MongoClient = Mongo.MongoClient;
var ObjectId = Mongo.ObjectID;
var url = 'mongodb://localhost:27017/test2';

var io: SocketIO.Server;

export function getDb(): Mongo.Db {
    return db.db;
}

export function startSocketIO<T extends models.DbObjectModel>(server: any): SocketIO.Server {
    io = socketio(server);
    io.on('connection', function(socket) {
        console.log('a user connected');
        socket.on('disconnect', function() {
            console.log('user disconnected');
        });

        socket.on('query', (requestId, path, query) => {
            console.log('query: ' + path + ': ' + JSON.stringify(query));
            query = query || {};
            query.filter = query.filter || {};
            query.sort = query.sort || {};
            db.get<T>(path, query.filter, query.sort, (data) => {
               console.log('Sending queryed: ' + 'queryed:' + path + ' - ' + console.log(JSON.stringify(data)));
                socket.emit('queryed:' + path, {
                    requestId: requestId,
                    data: data
                });
            });
        });


        socket.on('upsert', (requestId, path, data) => {
            console.log('upsert: ' + path + ': ' + JSON.stringify(data));
            db.exists(path, data._id, (exists: boolean) => {

                if (exists) {
                    db.patch<T>(path, data, (result, patch) => {
                        socket.emit('upserted:' + path, {
                            requestId: requestId,
                            result: result,
                            data: patch
                        });
                    });
                } else {
                    db.insert<T>(path, data, (result, item) => {
                        socket.emit('upserted:' + path, {
                            requestId: requestId,
                            result: result,
                            data: item
                        });
                    });
                }

            });
        });

        /*socket.on('insert', (requestId, path, data) => {
            console.log('insert: ' + path + ': ' + JSON.stringify(data));
            db.insert<T>(path, data, function(result, item) {
                socket.emit('inserted:' + path, {
                    requestId: requestId,
                    result: result,
                    data: item
                });
            });
        });

        socket.on('update', (requestId, path, data) => {
            console.log('update: ' + path + ': ' + JSON.stringify(data));
            db.patch<T>(path, data, function(result, patch) {
                socket.emit('updated:' + path, {
                    requestId: requestId,
                    result: result,
                    data: patch
                });
            });
        });*/

        socket.on('remove', (requestId, path, id) => {
            console.log('remove: ' + path + ': ' + id);
            db.remove(path, id, function(result, id) {
                socket.emit('removed:' + path, {
                    requestId: requestId,
                    result: result,
                    data: id
                });
            });
        });
    });

    return io;
}


/*
export function buildREST<T extends models.DbObjectModel>(app: express.Express, collectionName: string, sort: db.SortOptions = {}): express.Router {

    var api = express.Router();

    // REST API
    api.route('/' + collectionName)
        .get(function(req, res, next) {
            db.get<T>(collectionName, {}, sort, function(result) {
                res.send(result);
            });
        })
        .post(function(req, res, next) {
            db.insert<T>(collectionName, req.body, function(result, item) {
                io.emit('updated:' + collectionName, {
                    action: "inserted",
                    item: item,
                    result: result
                });
                res.send(result);
            });
        });

    api.route('/' + collectionName + '/:id')
        .get(function(req, res, next) {
            db.getById<T>(collectionName, req.params.id, function(result) {
                res.send(result);
            });
        })
        .patch(function(req, res, next) {
            db.patch<T>(collectionName, req.body, function(result, patch) {
                io.emit('updated:' + collectionName, {
                    action: "updated",
                    patch: patch,
                    result: result
                });
                res.send(result);
            });
        }).delete(function(req, res, next) {
            db.remove(collectionName, req.params.id, function(result, id) {
                io.emit('updated:' + collectionName, {
                    action: "deleted",
                    id: id,
                    result: result
                });
                res.send(result);
            });
        });

    app.use('/api', api);

    return api;
}*/
