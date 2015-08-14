/// <reference path="./typings/tsd.d.ts" />

import io = require('socket.io');

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

export interface ISyncImmutable {
  __: SyncNotifiers;
  lastModified: string;
  set(prop: string, value: any): ISyncImmutable;
  remove(prop: string): ISyncImmutable;
}

export class SyncNotifiers {
  private listeners: any[];
  constructor() {
    this.listeners = [];
  }
  onUpdated(callback: (updated: ISyncImmutable) => void) {
    this.listeners.push(callback);
  }
  notify(updated: ISyncImmutable) {
    this.listeners.forEach((callback: (updated: ISyncImmutable) => void) => {
        callback(updated);
    });
  }
}


export function MakeSyncImmutable(obj: Object): ISyncImmutable {
  if(obj.hasOwnProperty('__')) return obj as ISyncImmutable; // is ISyncImmutable
  var copy = {};

  Object.keys(obj).forEach((name: string) => {
      var prop = obj[name];
      if(typeof prop === 'object') {

        prop = MakeSyncImmutable(prop);

        prop.__.onUpdated((updated: ISyncImmutable) => {
           var newCopy = Utils.copyRefsExceptForProp(copy, name) as ISyncImmutable;
           newCopy[name] = updated;
           newCopy['lastModified'] = updated.lastModified;
           var newImmutable = MakeSyncImmutable(newCopy);
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
      value: (prop: string, value: any): ISyncImmutable => {
        if(copy[prop] !== value) {
          var newCopy = Utils.copyRefsExceptForProp(copy, prop);
          newCopy[prop] = value;
          newCopy['lastModified'] = new Date().toISOString();
          var replaceWithMe = MakeSyncImmutable(newCopy);
          copy['__'].notify(replaceWithMe); // notify old listeners
          return replaceWithMe;
        }
      }
  });

  Object.defineProperty(copy, 'remove', {
      enumerable: false,
      configurable: true,
      writable: true,
      value: (prop: string): ISyncImmutable => {
        if(!copy.hasOwnProperty(prop)) return copy as ISyncImmutable;
        console.log('doing remove', prop, copy);
        var newCopy = Utils.copyRefsExceptForProp(copy, prop);
        newCopy['lastModified'] = new Date().toISOString();
        var replaceWithMe = MakeSyncImmutable(newCopy);
        copy['__'].notify(replaceWithMe); // notify old listeners
        return replaceWithMe;
      }
  });

  return copy as ISyncImmutable;
}
