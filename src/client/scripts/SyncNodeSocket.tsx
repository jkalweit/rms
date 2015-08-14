/// <reference path="./typings/tsd.d.ts" />

import io = require('socket.io');
import SyncNode = require('./SyncNode');

"use strict";


export class SyncNodeSocket<T> {
    private path: string;
    private server: SocketIO.Server;
    private listeners: any[] = [];
    private syncNode: SyncNode.ISyncNode;
    constructor(path: string) {
        if (!(path[0] === '/')) path = '/' + path; //normalize

        this.path = path;

        var syncObject = JSON.parse(localStorage.getItem(this.path)) || { local: {} }; //get local cache

        this.syncNode = SyncNode.MakeSyncNode(syncObject);
        this.syncNode.__.onUpdated((updated: any) => {
            this.syncNode = updated;
            console.log('syncNode updated!!!!', this.syncNode);
            localStorage.setItem(this.path, JSON.stringify(this.syncNode));
            this.notify();
        });

        var socketHost = 'http://' + location.host + path;
        console.log('Connecting to namespace: \'' + socketHost + '\'');
        this.server = io(socketHost);

        this.server.emit('getLatest', syncObject.local.lastModified);

        this.server.on('updated', (updated: any) => {
            var updatedObj = JSON.parse(updated);
            console.log('handle update: ', updatedObj);
            this.syncNode.set('local', updatedObj);
        });
    }
    onUpdated(callback: (updated: T) => void) {
        this.listeners.push(callback);
    }
    notify() {
        this.listeners.forEach((callback: any) => {
            callback(this.get());
        });
    }
    get(): T {
        return this.syncNode['local'];
    }
}
