/// <reference path='./typings/tsd.d.ts' />

import socketio = require('socket.io');
import Persistence = require('./Persistence');


export class SyncNodeServer {
  namespace: string;
  persistence: Persistence.FilePersistence;
  io: SocketIO.Server;
  ioNamespace: SocketIO.Namespace;
  data: any;

  constructor(namespace: string, io: SocketIO.Server, defaultData: any = {}) {
    this.namespace  = namespace;
    this.io = io;
    this.persistence = new Persistence.FilePersistence(namespace, 'data\\');

    this.persistence.get((data: any) => {
        this.data = data || defaultData;
        this.start();
    });
  }

  start() {
    this.ioNamespace = this.io.of('/' + this.namespace);
    this.ioNamespace.on('connection', (socket: SocketIO.Socket) => {
        console.log('someone connected to ' + this.namespace);

        socket.on('getLatest', (clientLastModified: string) => {
            console.log('getLatest', this.data.lastModified, clientLastModified);
            if (!clientLastModified || clientLastModified < this.data.lastModified) {
                //console.log('sending: ', JSON.stringify(reconciliation));
                console.log('sending this.data', this.data);
                socket.emit('latest', JSON.stringify(this.data));
            }
        });

        function doMerge(obj: Object, merge: any) {
            //console.log('Doing merge: ', merge);
            if (typeof merge !== 'object') return merge;
            Object.keys(merge).forEach(key => {
                if (key === '__remove') {
                    delete obj[merge[key]];
                } else {
                    var nextObj = obj[key] || {};
                    // console.log('Doing merge here obj: ', nextObj);
                    // console.log('Doing merge here     merge: ', merge[key]);
                    obj[key] = doMerge(nextObj, merge[key]);
                }
            });
            return obj;
        }

        socket.on('update', (merge: string) => {
            var mergeObj = JSON.parse(merge);
            console.log('Do merge: ', mergeObj);
            doMerge(this.data, mergeObj);
            this.persistence.persist(this.data);
            socket.broadcast.emit('update', merge);
        });
    });
  }
}
