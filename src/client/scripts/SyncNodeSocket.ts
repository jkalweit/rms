/// <reference path="./typings/tsd.d.ts" />

import io = require('socket.io');
import Sync = require('./SyncNode');
import Logger2 = require('./Logger');

"use strict";

var Log = Logger2.Log;

export class SyncNodeSocket<T> {
    private path: string;
    private server: SocketIO.Server;
    private listeners: any[] = [];
    private syncNode: Sync.SyncNode;
    status: string;
    onStatusChanged: (path: string, status: string) => void;
    updatesDisabled: boolean = false; //To prevent loop when setting data received from server

    constructor(path: string, defaultObject: T) {
        this.status = 'Initializing...';

        if (!(path[0] === '/')) path = '/' + path; //normalize

        this.path = path;

        var localCached = JSON.parse(localStorage.getItem(this.path)); //get local cache

        this.syncNode = new Sync.SyncNode({ local: localCached || defaultObject });
        Sync.SyncNode.addNE(this.syncNode, 'onUpdated', this.createOnUpdated(this));

        var socketHost = 'http://' + location.host + path;
        console.log('Connecting to namespace: \'' + socketHost + '\'');
        this.server = io(socketHost);

        this.server.on('disconnect', () => {
            Log.log(this.path, 'Disconnected');
            console.log('*************DISCONNECTED');
            this.status = 'Disconnected';
            this.updateStatus(this.status);
            //this.updateStatus('Received update - last modified: ' + mergeObj.lastModified);
        });

        this.server.on('reconnect', (number: Number) => {
            Log.log(this.path, 'Reconnected after tries: ' + number);
            console.log('*************Reconnected');
            this.status = 'Connected';
            this.updateStatus(this.status);
            setTimeout(() => {
                this.getLatest();
            }, 2000);
        });

        this.server.on('reconnect_failed', (number: Number) => {
            Log.error(this.path, 'Reconnection Failed. Number of tries: ' + number);
            console.log('*************************Reconnection failed.');
            //this.status = 'Connected';
            //this.updateStatus(this.status);
            //this.updateStatus('Received update - last modified: ' + mergeObj.lastModified);
        });

        // function mergeByLastModified(node: Sync.SyncNode, merge: any) {
        //   console.log('Doing merge: ', merge);
        //   if (typeof merge !== 'object') return merge;
        //   Object.keys(merge).forEach(key => {
        //       if(node['lastModified'] < merge['lastModified']) {
        //         if (key === '__remove') {
        //             node.remove(merge[key] as string);
        //         } else {
        //             var nextNode = Node[key] || new Sync.SyncNode();
        //             console.log('Doing merge here obj: ', nextObj);
        //             console.log('Doing merge here     merge: ', merge[key]);
        //             nextNode.set(mergeByLastModified(nextObj, merge[key]);
        //         }
        //       }
        //   });
        //   return node;
        // }

        this.server.on('update', (merge: any) => {
            var mergeObj = JSON.parse(merge);
            Log.debug(this.path, 'received update: ' + merge);
            console.log('*************handle update: ', mergeObj);
            this.updatesDisabled = true;
            this.syncNode['local'].merge(mergeObj);
            this.updatesDisabled = false;
            //this.updateStatus('Received update - last modified: ' + mergeObj.lastModified);
        });

        this.server.on('latest', (latest: any) => {
            if (!latest) {
                console.log('already has latest.');
                Log.debug(this.path, 'already has latest.');
            } else {
                var latestObj = JSON.parse(latest);
                Log.debug(this.path, 'Received latest: ' + latest.lastModified);
                console.log('handle latest: ', latestObj);
                this.updatesDisabled = true;
                this.syncNode.set('local', latestObj);
                this.updatesDisabled = false;
                //this.updateStatus('Received latest - last modified: ' + latestObj.lastModified);
            }
        });

        this.getLatest();
    }
    getLatest() {
        this.server.emit('getLatest', this.get()['lastModified']);
    }
    updateStatus(status: string) {
        this.status = status;
        if (this.onStatusChanged) this.onStatusChanged(this.path, this.status);
    }
    createOnUpdated(node: SyncNodeSocket<T>): (updated: Sync.SyncNode, action: string, path: string, merge: any) => void {
        return (updated: Sync.SyncNode, action: string, path: string, merge: any): void => {

            Sync.SyncNode.addNE(updated, 'onUpdated', this.createOnUpdated(this));
            this.syncNode = updated;

            //console.log('syncNode updated:', action, path, merge, this.syncNode);
            localStorage.setItem(this.path, JSON.stringify(this.get()));
            if (!this.updatesDisabled) {
                this.server.emit('update', JSON.stringify(merge.local));
            }
            this.notify();
        };
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
