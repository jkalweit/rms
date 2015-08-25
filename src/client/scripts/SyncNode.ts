/// <reference path="./typings/tsd.d.ts" />

import Logger = require('./Logger');

"use strict";

var Log = Logger.Log;

//
// export class Utils {
//     static copyRefsExceptForProp(obj: Object, excludeProp: string): Object {
//         // Make a new object, and reuse the references on all props except excludeProp
//         var copy = {};
//         var propNames = Object.keys(obj);
//         propNames.forEach((name: string) => {
//             if (name !== excludeProp) {
//                 copy[name] = obj[name];
//             }
//         });
//         return copy;
//     }
// }

// export interface ISyncNode {
//   __?: SyncNotifiers;
//   lastModified?: string;
//   set?(prop: string, value: any): ISyncNode;
//   remove?(prop: string): ISyncNode;
// }
//
// export class SyncNotifiers {
//   private listeners: any[];
//   onUpdated: (updated: Object) => void;
// constructor() {
//   this.listeners = [];
// }
// onUpdated(callback: (updated: ISyncNode) => void) {
//   this.listeners.push(callback);
// }
// notify(updated: ISyncNode) {
//   this.listeners.forEach((callback: (updated: ISyncNode) => void) => {
//       callback(updated);
//   });
// }
// }

export interface ISyncNode {
  lastModified?: string;
  set?: (propName: string, value: any) => ISetResult;
  onUpdated?: (updated: Object, action: string, path: string, merge: any) => void;
  remove?: (propName: string) => SyncNode;
}

export interface ISetResult {
  value?: any;
  parentImmutable?: SyncNode;
}

var idCounterForDebugging = 0;

export class SyncNode implements ISyncNode {
    lastModified: string;
    set: (propName: string, value: any) => SyncNode;
    onUpdated: (updated: Object, action: string, path: string, merge: any) => void;
    remove: (propName: string) => SyncNode;

    constructor(obj?: Object, lastModified?: string, excludeProp?: string) {
        obj = obj || {};

        SyncNode.addNE(this, '__syncNodeId', idCounterForDebugging++);

        lastModified = lastModified || obj['lastModified'] || new Date(0).toISOString(); // default to a really old lastModified, Date(0).

        //console.log('exclude: ', excludeProp, 'keys', Object.keys(obj));

        Object.keys(obj).forEach((propName: string) => {

            if (propName === excludeProp || propName === 'lastModified') {
                //console.log('skipping prop: ', propName);
                return; // skip this prop.
            }
            //console.log('adding prop: ', propName);
            var prop = obj[propName];
            if (typeof prop === 'object') {
                var className = prop.constructor.toString().match(/\w+/g)[1];
                //console.log('ClassName: ' + className, propName);
                if (className !== 'SyncNode') {
                    prop = new SyncNode(prop, prop.lastModified || lastModified);
                    //console.log('herrrrrre2')
                    SyncNode.addNE(prop, 'onUpdated', SyncNode.createOnUpdated(this, propName));
                } else {
                    //console.log('herrrrrre        1')
                }
            }

            SyncNode.addImmutable(this, propName, prop);
        });

        delete this.lastModified;
        SyncNode.addImmutableButConfigurable(this, 'lastModified', lastModified);


        SyncNode.addNE(this, 'set', SyncNode.createSetter(this));
        SyncNode.addNE(this, 'remove', SyncNode.createRemover(this));
    }

    merge(update: any) {
        console.log('merge: ', update);
        if (typeof update !== 'object') {
            var message = 'WARNING: passed a non-object to merge.';
            console.log(message);
            Log.error('SyncNode', message);
            return;
        }

        if (this.lastModified > update.lastModified) {
          var message = '****WARNING*****: local version is NEWER than server version.' + this.lastModified + ' ' + update.lastModified;
          console.log(message);
          Log.error('SyncNode', message);
        }

        var current: ISyncNode = this;

        Object.keys(update).forEach(key => {
            if (key === 'lastModified') {
                delete current.lastModified;
                SyncNode.addImmutableButConfigurable(current, 'lastModified', update['lastModified']);
            }
            else if (key === '__remove') {
                current.remove(update[key]);
            } else {
                var nextNode = current[key];
                if (!nextNode || typeof update[key] !== 'object') {
                    current = current.set(key, update[key]).parentImmutable;
                } else {
                    nextNode.merge(update[key]);
                }
            }
        });
    }

    // static copyPropsImmutable(copyFrom: Object, copyTo: SyncNode, lastModified: string, excludeProp?: string) {
    //     Object.keys(copyFrom).forEach((name: string) => {
    //
    //         if (name === excludeProp) return; // skip this prop.
    //
    //         var prop = copyFrom[name];
    //         if (typeof prop === 'object') {
    //             var className = prop.constructor.toString().match(/\w+/g)[1];
    //             console.log('ClassName: ' + className);
    //             if (className !== 'SyncNode') {
    //                 prop = new SyncNode(prop, prop.lastModified || lastModified);
    //                 console.log('herrrrrre2')
    //                 SyncNode.addNE(prop, 'onUpdated', SyncNode.createOnUpdated(copyTo, name));
    //             } else {
    //                 console.log('herrrrrre        1')
    //             }
    //         }
    //
    //         SyncNode.addImmutable(copyTo, name, prop);
    //     });
    // }

    static createOnUpdated(target: SyncNode, propName: string): (updated: SyncNode, action: string, path: string, merge: any) => SyncNode {
        var onUpdated = (updated: SyncNode, action: string, path: string, merge: any): SyncNode => {
            var replaceWithMe = new SyncNode(target, updated.lastModified, propName);
            //console.log('CreateOnUpdated: updated: ', updated);
            //console.log('CreateOnUpdated: replaceWithMe: ', replaceWithMe);
            SyncNode.addImmutable(replaceWithMe, propName, updated);
            SyncNode.addNE(updated, 'onUpdated', SyncNode.createOnUpdated(replaceWithMe, propName));
            //console.log('Doing update!', prop, target, updated, replaceWithMe);
            var newPath = propName + (path ? '.' + path : '');
            var newMerge = { lastModified: replaceWithMe.lastModified };
            newMerge[propName] = merge;
            target.onUpdated(replaceWithMe, action, newPath, newMerge);
            return replaceWithMe;
        };
        return onUpdated;
    }

    static createSetter(target: SyncNode): (propName: string, value: any) => ISetResult {
        var set = (propName: string, value: any): ISetResult => {
            if (target[propName] !== value) {
                //console.log('Setting propName: ', propName);
                var replaceWithMe = new SyncNode(target, new Date().toISOString(), propName);

                if (typeof value === 'object') {
                    var className = value.constructor.toString().match(/\w+/g)[1];
                    if (className !== 'SyncNode') {
                        value = new SyncNode(value, value.lastModified || new Date().toISOString());
                        SyncNode.addNE(value, 'onUpdated', SyncNode.createOnUpdated(replaceWithMe, propName));
                    }
                }

                SyncNode.addImmutable(replaceWithMe, propName, value);
                var merge = { lastModified: replaceWithMe.lastModified };
                merge[propName] = value;
                target.onUpdated(replaceWithMe, 'set', propName, merge);
                return { value: value, parentImmutable: replaceWithMe };
            }
            return { value: value, parentImmutable: target};
        };
        return set;
    }

    static createRemover(target: SyncNode): (propName: string) => SyncNode {

        var remover = (propName: string): SyncNode => {
            //console.log('doing remove on ', prop, target);
            if (!target.hasOwnProperty(propName)) return target;
            var replaceWithMe = new SyncNode(target, new Date().toISOString(), propName);
            //console.log('replaceWithMe: ', prop, target, replaceWithMe);
            target.onUpdated(replaceWithMe, 'remove', propName, { __remove: propName }); // notify old listeners
            return replaceWithMe;
        };
        return remover;
    }


    static addNE(obj: Object, propName: string, value: any) {
        Object.defineProperty(obj, propName, {
            enumerable: false,
            configurable: true,
            writable: true,
            value: value
        });
    }
    static addImmutable(obj: Object, propName: string, value: any) {
        Object.defineProperty(obj, propName, {
            enumerable: true,
            configurable: false,
            writable: false,
            value: value
        });
    }
    static addImmutableButConfigurable(obj: Object, propName: string, value: any) {
        Object.defineProperty(obj, propName, {
            enumerable: true,
            configurable: true,
            writable: false,
            value: value
        });
    }
}

//
// export function MakeSyncNode(obj: Object): ISyncNode {
//     if (obj.hasOwnProperty('__')) return obj as ISyncNode; // is ISyncNode
//     var copy = {};
//
//     Object.keys(obj).forEach((name: string) => {
//         var prop = obj[name];
//         if (typeof prop === 'object') {
//
//             prop = MakeSyncNode(prop);
//
//             prop.__.onUpdated((updated: ISyncNode) => {
//                 var newCopy = Utils.copyRefsExceptForProp(copy, name) as ISyncNode;
//                 newCopy[name] = updated;
//                 newCopy['lastModified'] = updated.lastModified;
//                 var newImmutable = MakeSyncNode(newCopy);
//                 Object.defineProperty(newImmutable, '__', {
//                     enumerable: false,
//                     configurable: true,
//                     writable: true,
//                     value: (copy as any).__
//                 });
//                 newImmutable.__.notify(newImmutable);
//             });
//         }
//
//         Object.defineProperty(copy, name, {
//             enumerable: true,
//             configurable: false,
//             writable: false,
//             value: prop
//         });
//
//         if (!copy.hasOwnProperty('lastModified')) copy['lastModified'] = new Date().toISOString();
//     });
//
//
//     Object.defineProperty(copy, '__', {
//         enumerable: false,
//         configurable: true,
//         writable: true,
//         value: new SyncNotifiers()
//     });
//
//     Object.defineProperty(copy, 'set', {
//         enumerable: false,
//         configurable: true,
//         writable: true,
//         value: (prop: string, value: any): ISyncNode => {
//             if (copy[prop] !== value) {
//                 var newCopy = Utils.copyRefsExceptForProp(copy, prop);
//                 newCopy[prop] = value;
//                 newCopy['lastModified'] = new Date().toISOString();
//                 var replaceWithMe = MakeSyncNode(newCopy);
//                 console.log('about to do notify: ', replaceWithMe);
//                 copy['__'].notify(replaceWithMe); // notify old listeners
//                 return replaceWithMe;
//             }
//         }
//     });
//
//     Object.defineProperty(copy, 'remove', {
//         enumerable: false,
//         configurable: true,
//         writable: true,
//         value: (prop: string): ISyncNode => {
//             if (!copy.hasOwnProperty(prop)) return copy as ISyncNode;
//             console.log('doing remove', prop, copy);
//             var newCopy = Utils.copyRefsExceptForProp(copy, prop);
//             newCopy['lastModified'] = new Date().toISOString();
//             var replaceWithMe = MakeSyncNode(newCopy);
//             copy['__'].notify(replaceWithMe); // notify old listeners
//             return replaceWithMe;
//         }
//     });
//
//     return copy as ISyncNode;
// }
