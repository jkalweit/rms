/// <reference path='./typings/tsd.d.ts' />

import socketio = require('socket.io');
import Persistence = require('./Persistence');

interface Request {
    requestGuid?: string;
    stamp?: Date;
    data?: any;
}


class Response {
    requestGuid: string;
    stamp: Date;
    data: any;

    constructor(requestGuid: string, data?: any) {
      this.requestGuid = requestGuid;
      this.stamp = new Date();
      this.data = data;
    }
}

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

  handleUpdate() {

  }
  doMerge(obj: Object, merge: any) {
      //console.log('Doing merge: ', merge);
      if (typeof merge !== 'object') return merge;
      Object.keys(merge).forEach(key => {
          if(key === 'lastModified' && obj[key] > merge[key]) {
            console.error('Server version lastModified GREATER THAN merge lastModified', obj[key], merge[key]);
          }
          if (key === '__remove') {
              delete obj[merge[key]];
          } else {
              var nextObj = obj[key] || {};
              // console.log('Doing merge here obj: ', nextObj);
              // console.log('Doing merge here     merge: ', merge[key]);
              obj[key] = this.doMerge(nextObj, merge[key]);
          }
      });
      return obj;
  }
  persist() {
    this.persistence.persist(this.data);
  }
  start() {
    this.ioNamespace = this.io.of('/' + this.namespace);
    this.ioNamespace.on('connection', (socket: SocketIO.Socket) => {
        console.log('someone connected to ' + this.namespace);

        socket.on('getLatest', (clientLastModified: string) => {
            console.log('getLatest', this.data.lastModified, clientLastModified);
            if (!clientLastModified || clientLastModified < this.data.lastModified) {
                //console.log('sending: ', JSON.stringify(reconciliation));
                //console.log('sending latest', this.data);
                socket.emit('latest', this.data);
            } else {
                console.log('already has latest.');
                socket.emit('latest', null);
            }
        });



        socket.on('update', (request: Request) => {
            var merge = request.data;
            //console.log('Do merge: ', merge);
            this.doMerge(this.data, merge);
            this.persist();
            socket.emit('updateResponse', new Response(request.requestGuid, null));
            socket.broadcast.emit('update', merge);
            //this.ioNamespace.emit('update', merge); // TODO: This was a hack to make sync work.
        });
    });
  }
}
