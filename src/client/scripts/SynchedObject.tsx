/// <reference path="./typings/tsd.d.ts" />

import io = require('socket.io');

export interface ISyncTreeNode {
    __: SyncNotifiers; // not enumerable
    lastModified: string;
}

export class SyncNotifiers {
    listeners: any[] = [];
    obj: ISyncTreeNode;
    constructor(obj: ISyncTreeNode) {
        this.obj = obj;
    }
    notify(updated: ISyncTreeNode) {
        this.listeners.map((callback: (updated: ISyncTreeNode) => void) => {
            console.log('doing callback');
            callback(updated);
        });
    }
    onUpdated(callback: (updated: any) => void) {
        this.listeners.push(callback);
    }
    get() {
        return this.obj;
    }
    set(key: string, value: any) {
        console.log('here');
        if (this.obj[key] !== value) {
            console.log('Doing set: ' + key, value, this.obj);
            this.obj[key] = value;
            var lastModified = new Date().toISOString();
            if(typeof value === 'object' && !value.hasOwnProperty('lastModified')) {
              value.lastModified = lastModified;
            }
            this.obj.lastModified = lastModified;
            console.log('upateding last modified: ', this.obj.lastModified);
            this.notify(this.get());
        } else {
            console.log('Skipping set: ', key, value, this.obj);
        }
    }
    setByPath(keys: string[], value: any) {
        console.log('keys: ', keys);
        if (keys.length === 1) {
            this.set(keys[0], value);
        } else {
            var next = this.obj[keys[0]];
            if (next === undefined) {
                next = {};
                SyncNotifiers.addNotifiers(next, (updated: ISyncTreeNode) => {
                  this.obj.lastModified = updated.lastModified;
                  this.notify(this.get());
                });
                this.obj[keys[0]] = next;
            }
            next.__.setByPath(keys.splice(1, keys.length - 1), value);
        }
    }

    static addNotifiers(obj: ISyncTreeNode, updateCallback: (updated: ISyncTreeNode) => void) {

        if (typeof obj !== 'object') return;
        if (obj.hasOwnProperty('__')) return;

        var childUpdateCallback = (updated: ISyncTreeNode): void => {
            obj.lastModified = updated.lastModified;
            obj.__.notify(obj.__.get());
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
        if(updateCallback) {
            obj.__.onUpdated(updateCallback);
        }
    }
}


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
        console.log('Mutable: ', mutable);
    }

    get(): any {
        return this.__.get();
    }


    setByPath(key: string, value: any) {
        console.log('Setting by path: ' + key, value);

        console.log('Before: ', this.__.obj);

        var keySplit = key.split('.');
        this.__.setByPath(keySplit, value);

        console.log('After: ', this.__.obj);
    }

    //
    // addNE(node: Object, attrs: { [key: string]: any }) {
    //     for (var key in attrs) {
    //         Object.defineProperty(node, key, {
    //             enumerable: false,
    //             configurable: true,
    //             writable: true,
    //             value: attrs[key]
    //         });
    //     }
    // }

    // addSetters(obj: Object, parent: Object) {
    //     var propNames = Object.getOwnPropertyNames(obj);
    //     propNames.forEach((name: string) => {
    //         var prop = obj[name];
    //         if (typeof prop == 'object' && !Object.hasOwnProperty('__')) {
    //             this.addSetters(prop, obj);
    //         }
    //     });
    //     var listeners: any[] = [];
    //     var notify = (updated: Object) => {
    //         listeners.map((callback: (updated: Object) => void) => {
    //             callback(updated);
    //         });
    //     };
    //     var listen = (callback: () => void) => {
    //         listeners.push(callback);
    //     };
    //     var setters = {
    //         parent: parent,
    //         listeners: listeners,
    //         listen: listen,
    //         notify: notify,
    //         get: () => {
    //             return obj;
    //         },
    //         set: (key: string, value: any) => {
    //             console.log('Doing set: ' + key, value);
    //             obj['lastModified'] = new Date().toISOString();
    //             obj[key] = value;
    //             notify(obj);
    //         }
    //     };
    //
    //     this.addNE(obj, { '__': setters });
    // }

    // taken from developer.mozilla.org -JDK 2015-08-12
    // deepFreeze(obj: Object) {
    //     var propNames = Object.getOwnPropertyNames(obj);
    //     propNames.forEach(function(name) {
    //         var prop = obj[name];
    //         if (typeof prop == 'object' && !Object.isFrozen(prop))
    //             this.deepFreeze(prop);
    //     });
    //     Object.freeze(obj);
    // }
    //
    // get(): T {
    //     return this.immutable;
    // }



    // merge(value: any) {
    //     console.log('Merging: ', value);
    //     var recursiveFindNode = (keys: string[], curr: any): any => {
    //         if (keys.length === 1) {
    //             return curr;
    //         } else {
    //             var next = curr[keys[0]];
    //             if (next === undefined) {
    //                 next = {};
    //                 curr[keys[0]] = next;
    //             }
    //             return recursiveFindNode(keys.splice(0, 1), next);
    //         }
    //     }
    //
    //     console.log('Before: ', this.immutable);
    //
    //     var keySplit = key.split('.');
    //     var node = recursiveFindNode(keySplit, this.immutable);
    //     node.__.set(keySplit[keySplit.length - 1], value);
    //
    //     console.log('After: ', this.immutable);
    // }
}
