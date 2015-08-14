/// <reference path="./typings/tsd.d.ts" />

"use strict";


export class Utils {
    static copyRefsExceptForProp(obj: Object, excludeProp: string): Object {
        // Make a new object, and reuse the references on all props except excludeProp
        var copy = {};
        var propNames = Object.keys(obj);
        propNames.forEach((name: string) => {
            if (name !== excludeProp) {
                copy[name] = obj[name];
            }
        });
        return copy;
    }
}

export interface ISyncNode {
  __: SyncNotifiers;
  lastModified: string;
  set(prop: string, value: any): ISyncNode;
  remove(prop: string): ISyncNode;
}

export class SyncNotifiers {
  private listeners: any[];
  constructor() {
    this.listeners = [];
  }
  onUpdated(callback: (updated: ISyncNode) => void) {
    this.listeners.push(callback);
  }
  notify(updated: ISyncNode) {
    this.listeners.forEach((callback: (updated: ISyncNode) => void) => {
        callback(updated);
    });
  }
}


export function MakeSyncNode(obj: Object): ISyncNode {
  if(obj.hasOwnProperty('__')) return obj as ISyncNode; // is ISyncNode
  var copy = {};

  Object.keys(obj).forEach((name: string) => {
      var prop = obj[name];
      if(typeof prop === 'object') {

        prop = MakeSyncNode(prop);

        prop.__.onUpdated((updated: ISyncNode) => {
           var newCopy = Utils.copyRefsExceptForProp(copy, name) as ISyncNode;
           newCopy[name] = updated;
           newCopy['lastModified'] = updated.lastModified;
           var newImmutable = MakeSyncNode(newCopy);
           Object.defineProperty(newImmutable, '__', {
               enumerable: false,
               configurable: true,
               writable: true,
               value: (copy as any).__
           });
           newImmutable.__.notify(newImmutable);
        });
      }

      Object.defineProperty(copy, name, {
          enumerable: true,
          configurable: false,
          writable: false,
          value: prop
      });

      if(!copy.hasOwnProperty('lastModified')) copy['lastModified'] = new Date().toISOString();
  });


  Object.defineProperty(copy, '__', {
      enumerable: false,
      configurable: true,
      writable: true,
      value: new SyncNotifiers()
  });

  Object.defineProperty(copy, 'set', {
      enumerable: false,
      configurable: true,
      writable: true,
      value: (prop: string, value: any): ISyncNode => {
        if(copy[prop] !== value) {
          var newCopy = Utils.copyRefsExceptForProp(copy, prop);
          newCopy[prop] = value;
          newCopy['lastModified'] = new Date().toISOString();
          var replaceWithMe = MakeSyncNode(newCopy);
          copy['__'].notify(replaceWithMe); // notify old listeners
          return replaceWithMe;
        }
      }
  });

  Object.defineProperty(copy, 'remove', {
      enumerable: false,
      configurable: true,
      writable: true,
      value: (prop: string): ISyncNode => {
        if(!copy.hasOwnProperty(prop)) return copy as ISyncNode;
        console.log('doing remove', prop, copy);
        var newCopy = Utils.copyRefsExceptForProp(copy, prop);
        newCopy['lastModified'] = new Date().toISOString();
        var replaceWithMe = MakeSyncNode(newCopy);
        copy['__'].notify(replaceWithMe); // notify old listeners
        return replaceWithMe;
      }
  });

  return copy as ISyncNode;
}
