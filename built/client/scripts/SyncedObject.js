/// <reference path="./typings/tsd.d.ts" />
define(["require", "exports"], function (require, exports) {
    "use strict";
    var Utils = (function () {
        function Utils() {
        }
        Utils.copyRefsExceptForProp = function (obj, excludeProp) {
            var copy = {};
            var propNames = Object.keys(obj);
            propNames.forEach(function (name) {
                if (name !== excludeProp) {
                    copy[name] = obj[name];
                }
            });
            return copy;
        };
        return Utils;
    })();
    exports.Utils = Utils;
    var SyncNotifiers = (function () {
        function SyncNotifiers() {
            this.listeners = [];
        }
        SyncNotifiers.prototype.onUpdated = function (callback) {
            this.listeners.push(callback);
        };
        SyncNotifiers.prototype.notify = function (updated) {
            this.listeners.forEach(function (callback) {
                callback(updated);
            });
        };
        return SyncNotifiers;
    })();
    exports.SyncNotifiers = SyncNotifiers;
    function MakeSyncImmutable(obj) {
        if (obj.hasOwnProperty('__'))
            return obj;
        var copy = {};
        Object.keys(obj).forEach(function (name) {
            var prop = obj[name];
            if (typeof prop === 'object') {
                prop = MakeSyncImmutable(prop);
                prop.__.onUpdated(function (updated) {
                    var newCopy = Utils.copyRefsExceptForProp(copy, name);
                    newCopy[name] = updated;
                    newCopy['lastModified'] = updated.lastModified;
                    var newImmutable = MakeSyncImmutable(newCopy);
                    Object.defineProperty(newImmutable, '__', {
                        enumerable: false,
                        configurable: true,
                        writable: true,
                        value: copy.__
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
            if (!copy.hasOwnProperty('lastModified'))
                copy['lastModified'] = new Date().toISOString();
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
            value: function (prop, value) {
                if (copy[prop] !== value) {
                    var newCopy = Utils.copyRefsExceptForProp(copy, prop);
                    newCopy[prop] = value;
                    newCopy['lastModified'] = new Date().toISOString();
                    var replaceWithMe = MakeSyncImmutable(newCopy);
                    copy['__'].notify(replaceWithMe);
                    return replaceWithMe;
                }
            }
        });
        Object.defineProperty(copy, 'remove', {
            enumerable: false,
            configurable: true,
            writable: true,
            value: function (prop) {
                if (!copy.hasOwnProperty(prop))
                    return copy;
                console.log('doing remove', prop, copy);
                var newCopy = Utils.copyRefsExceptForProp(copy, prop);
                newCopy['lastModified'] = new Date().toISOString();
                var replaceWithMe = MakeSyncImmutable(newCopy);
                copy['__'].notify(replaceWithMe);
                return replaceWithMe;
            }
        });
        return copy;
    }
    exports.MakeSyncImmutable = MakeSyncImmutable;
});
//# sourceMappingURL=SyncedObject.js.map