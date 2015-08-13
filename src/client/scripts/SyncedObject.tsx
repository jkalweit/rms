/// <reference path="./typings/tsd.d.ts" />

import io = require('socket.io');

"use strict";


export class Utils {
    static makeImmutable(obj: any): any {
        var copy = JSON.parse(JSON.stringify(obj));
        return Utils.deepFreeze(copy);
    }
    static deepFreeze(obj: any) {
        if(Object.isFrozen(obj)) return obj; // Shallow check, assumes child objects already frozen
        var propNames = Object.getOwnPropertyNames(obj);
        propNames.forEach((name: string) => {
            var prop = obj[name];
            if (typeof prop == 'object' && !Object.isFrozen(prop))
                Utils.deepFreeze(prop);
        });

        Object.freeze(obj);
        return obj;
    }
    static copyRefsExceptForProp(obj: Object, excludeProp: string): Object {
        // Make a new object, and reuse the references on all props except excludeProp
        var copy = {};
        var propNames = Object.getOwnPropertyNames(obj);
        propNames.forEach((name: string) => {
            if (name !== excludeProp) {
                copy[name] = obj[name];
            }
        });
        return copy;
    }
}


export function MakeSyncImmutable(obj: Object): Object {

  var copy = {};

  var propNames = Object.getOwnPropertyNames(obj);
  propNames.forEach((name: string) => {
      var prop = obj[name];
      if(typeof prop === 'object') {
        prop = MakeSyncImmutable(prop);
      }

      Object.defineProperty(copy, name, {
          enumerable: true,
          configurable: false,
          writable: false,
          value: prop
      });

      Object.defineProperty(copy, '__', {
          enumerable: false,
          configurable: true,
          writable: true,
          value: { test: 'accessors here' }
      });
  });

  return copy;
}


export class SyncNode {
    listeners: any[] = [];
    immutable: any;
    constructor(obj: Object) {
        this.immutable = Utils.makeImmutable(obj);
        //obj['name'] = 'test1';
        //this.immutable['name'] = 'test2';
        //console.log('obj:  ', obj);
        //console.log('immutable: ', this.immutable);
    }
    get() {
        return this.immutable;
    }
    notify(updated: SyncNode) {
        this.listeners.map((callback: (updated: SyncNode) => void) => {
            //console.log('doing callback');
            callback(updated);
        });
    }
    onUpdated(callback: (updated: SyncNode) => void) {
        this.listeners.push(callback);
    }
    set(key: string, value: any) {
        if (this.immutable[key] !== value) {
            console.log('Doing set: ' + key, value, this.immutable);

            var lastModified = new Date().toISOString();
            /*if (typeof value === 'object' && !value.hasOwnProperty('lastModified')) {
                value.lastModified = lastModified;
            }*/

            var copy = Utils.copyRefsExceptForProp(this.immutable, key);
            /*console.log('Before:', copy);
            SyncNotifiers.addNotifiers(copy, (updated: ISyncTreeNode) => {
                this.set(key, updated);
            });
            console.log('After:', copy);*/
            /*SyncNotifiers.addNotifiers(value, (updated: ISyncTreeNode) => {
                this.set(key, updated);
            });*/
            var immutableValue = Utils.makeImmutable(value);
            copy[key] = immutableValue;
            copy['lastModified'] = lastModified;
            Object.freeze(copy); // Finally, shallow freeze the copy. Assumes all children are already frozen.
            this.immutable = copy;

            this.notify(this.get());
            return this.get();
        } else {
            console.log('Skipping set: ', key, value, this.immutable);
            return this.get();
        }
    }
    setByPath(keys: string[], value: any) {
        var currKey = keys[0];
        if (keys.length === 1) {
            this.set(currKey, value);
        } else {
            var next = this.immutable[currKey];

            if (next === undefined) {
              var newMe = this.set(currKey, {});
                console.log(currKey, 'newMe: ', newMe);
                next = newMe[currKey];
            }
            next.__.setByPath(keys.splice(1, keys.length - 1), value);
        }
    }
/*
    static addNotifiers(obj: Object, updateCallback: (updated: ISyncTreeNode) => void) {

        if (typeof obj !== 'object') return;
        if (Object.isFrozen(obj)) {
          console.log('Error: Trying to addNotifiers to frozen obj...', obj);
          return;
        }
        if (obj.hasOwnProperty('__')) return;

        var childUpdateCallback = (updated: ISyncTreeNode): void => {
            obj['lastModified'] = updated.lastModified;
            obj['__'].notify(obj['__'].get());
        };

        var propNames = Object.getOwnPropertyNames(obj);
        propNames.forEach((name: string) => {
            var prop = obj[name];
            SyncNotifiers.addNotifiers(prop, childUpdateCallback);
        });

        var notifiers = new SyncNotifiers(obj as ISyncTreeNode);
        Object.defineProperty(obj, '__', {
            enumerable: false,
            configurable: true,
            writable: true,
            value: notifiers
        });
        if (updateCallback) {
            obj['__'].onUpdated(updateCallback);
        }
    }*/
}

/*
export class SyncedObject<T extends Object> implements ISyncTreeNode {
    server: SocketIO.Server;
    __: SyncNotifiers;
    lastModified: string;
    constructor(path: string) {

        // var socketHost = 'http://' + location.host + '/' + path;
        // console.log('Connecting to namespace: \'' + socketHost + '\'');
        // this.server = io(socketHost);
        var mutable = JSON.parse(localStorage.getItem(path)) || { name: 'Hallo Rec', lastModified: new Date().toISOString() };
        this.__ = new SyncNotifiers(mutable);
        SyncNotifiers.addNotifiers(mutable, null);
        //console.log('Mutable: ', mutable);
    }

    get(): any {
        return this.__.get();
    }


    setByPath(key: string, value: any) {
        //console.log('Setting by path: ' + key, value);

        //console.log('Before: ', this.__.obj);

        var keySplit = key.split('.');
        this.__.setByPath(keySplit, value);

        //console.log('After: ', this.__.obj);
    }

}*/
