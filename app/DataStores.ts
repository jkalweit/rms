/// <reference path="../typings/tsd.d.ts" />


import io = require('socket.io');

import models = require('./models');



export function guid(): string {
    function s4() {
        return Math.floor((1 + Math.random()) * 0x10000)
            .toString(16)
            .substring(1);
    }
    return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
}


export class Request {
    id: string;
    initiatedAt: Date;
    action: string;
    path: string;
    data: any;
}

export interface IDataStoreCallbacks<T extends models.DbObjectModel> {
    queryCallback?: (items: T[]) => void;
    upsertCallback?: (item?: T) => void;
    removeCallback?: () => void;
}

export interface IDataStore<T extends models.DbObjectModel> {
    collectionName: string;
    on(event: string, callback: any);
    query(): void; //TODO: Make promises
    insert<T>(data: T): void; //TODO: Make promises
    update<T>(data: T): void; //TODO: Make promises
    remove(id: string): void; //TODO: Make promises
    init(): void;
}

export class DataStoreBase<T extends models.DbObjectModel> implements IDataStore<T> {
    collectionName: string;
    subscriptions: any;

    constructor(collectionName) {
        this.collectionName = collectionName;
        this.subscriptions = {};
    }

    query(): void { }
    insert<T>(data: T): void { }
    update<T>(data: T): void { }
    remove(id: string): void { }
    init(): void {}

    notifySubscribers(event: string, params: any) {
        this.subscriptions[event] = this.subscriptions[event] || [];
        this.subscriptions[event].map((subscriber) => {
            subscriber(params);
        });
    }

    on(event: string, callback: (data: any) => void) {
        this.subscriptions[event] = this.subscriptions[event] || [];
        this.subscriptions[event].push(callback);
    }
}


export class LocalPersistence<T extends models.DbObjectModel> extends DataStoreBase<T> {
    collectionName: string;
    collection: {};
    callbacks: IDataStoreCallbacks<T>;

    init() {
      var fromStorage = localStorage.getItem(this.collectionName);
      //console.log('Read from storage: ' + fromStorage);
      this.collection = JSON.parse(fromStorage) || {};
    }

    setCollection(data: T[]) {
      this.collection = {};
      data.forEach((item: T) => {
        this.collection[item._id] = item;
      });
      this.persist();
    }

    query() {
        var result: T[] = [];
        for (var id in this.collection) {
            result.push(this.collection[id]);
        }
        //console.log('Queryed: ' + JSON.stringify(result));
        this.notifySubscribers('queryed', result);
    }

    insert(data: T) {
        this.notifySubscribers('inserted', this.upsertHelper(data));
    }
    update(data: T) {
        this.notifySubscribers('updated', this.upsertHelper(data));
    }

    upsertHelper(data: T) : T {
      if (!data._id) {
          data._id = guid();
      }
      if (!data.created) {
          data.created = new Date();
      }
      data.lastModified = new Date();

      // console.log('Upserting: ' + data);
      this.collection[data._id] = data;
      this.persist();
      return data;
    }

    remove(id: string) {
        delete this.collection[id];
        this.persist();
        this.notifySubscribers('removed', id);
    }

    persist() {
        var stringified = JSON.stringify(this.collection);
        //console.log('Persisting: ' + stringified);
        localStorage.setItem(this.collectionName, stringified);
    }
}























export interface SocketIODataStoreResult<T extends models.DbObjectModel> {
    requestId: string;
    result: any;
    data?: any;
}


export class SocketIODataStore<T extends models.DbObjectModel> extends DataStoreBase<T> {
    guid: string;
    collectionName: string;
    callbacks: IDataStoreCallbacks<T>;
    openRequests: any = {};
    socket: SocketIO.Server;
    subscriptions: {}

    local: LocalPersistence<T>;

    constructor(collectionName: string) {
        super(collectionName);

        this.local = new LocalPersistence<T>(collectionName);
        this.local.on('queryed', (data) => { this.notifySubscribers('queryed', data); } );
        this.local.on('inserted', (data) => { this.notifySubscribers('inserted', data); } );
        this.local.on('updated', (data) => { this.notifySubscribers('updated', data); } );
        this.local.on('removed', (data) => { this.notifySubscribers('removed', data); } );

        window.onbeforeunload = (e) => {
          if(Object.keys(this.openRequests).length > 0) {
            this.showOpenRequests();
            return 'There are unsaved changes, exit anyway?';
          }
        }

        var socketHost = 'http://' + location.host + '/' + this.collectionName;
        console.log('Connecting to namespace: \'' + socketHost + '\'');
        this.socket = io(socketHost);

        this.socket.on('queryed', (data: SocketIODataStoreResult<T>) => {
            //console.log('queryed: ' + this.collectionName + ': ' + JSON.stringify(data));
            this.clearRequest(data.requestId);
            this.local.setCollection(data.data);
            this.notifySubscribers('queryed', data.data);
        });

        this.socket.on('inserted', (data: SocketIODataStoreResult<T>) => {
            //console.log('upserted: ' + this.collectionName + ': ' + JSON.stringify(data));
            this.clearRequest(data.requestId);
            this.local.insert(data.data);
        });

        this.socket.on('updated', (data: SocketIODataStoreResult<T>) => {
            //console.log('upserted: ' + this.collectionName + ': ' + JSON.stringify(data));
            this.clearRequest(data.requestId);
            this.local.update(data.data);
        });

        this.socket.on('removed', (data: SocketIODataStoreResult<T>) => {
            //console.log('Removed: ' + this.collectionName + ': ' + JSON.stringify(data));
            this.clearRequest(data.requestId);
            this.local.remove(data.data);
        });
    }

    init() {
      this.local.init();
      // refresh local cache
      this.sendRequest('query', {});
    }

    query() {
        this.local.query();
    }
    insert(data: T) {
        this.local.insert(data);
        this.sendRequest('insert', data);
    }
    update(data: T) {
        this.local.update(data);
        this.sendRequest('update', data);
    }
    remove(id) {
        this.local.remove(id);
        this.sendRequest('remove', id);
    }


    showOpenRequests() {
        console.log("Open Requests:");
        for (var id in this.openRequests) {
            console.log(id + ' = ' + JSON.stringify(this.openRequests[id]));
        }
    }

    sendRequest(action: string, data: any) {
        var request = new Request();
        request.id = guid();
        request.initiatedAt = new Date();
        request.action = action;
        request.path = this.collectionName;
        request.data = data;

        this.openRequests[request.id] = request;
        //console.log('Sending request: ' + this.collectionName + ': ' + JSON.stringify(request));
        this.socket.emit('crud', request);
        //this.showOpenRequests();
    }
    clearRequest(id: string) {
        delete this.openRequests[id];
        //this.showOpenRequests();
    }
}
