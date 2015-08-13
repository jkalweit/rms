/// <reference path="./typings/tsd.d.ts" />
define(["require", "exports"], function (require, exports) {
    "use strict";
    var Utils = (function () {
        function Utils() {
        }
        Utils.makeImmutable = function (obj) {
            var copy = JSON.parse(JSON.stringify(obj));
            return Utils.deepFreeze(copy);
        };
        Utils.deepFreeze = function (obj) {
            if (Object.isFrozen(obj))
                return obj;
            var propNames = Object.getOwnPropertyNames(obj);
            propNames.forEach(function (name) {
                var prop = obj[name];
                if (typeof prop == 'object' && !Object.isFrozen(prop))
                    Utils.deepFreeze(prop);
            });
            Object.freeze(obj);
            return obj;
        };
        Utils.copyRefsExceptForProp = function (obj, excludeProp) {
            var copy = {};
            var propNames = Object.getOwnPropertyNames(obj);
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
    function MakeSyncImmutable(obj) {
        var copy = {};
        var propNames = Object.getOwnPropertyNames(obj);
        propNames.forEach(function (name) {
            var prop = obj[name];
            if (typeof prop === 'object') {
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
    exports.MakeSyncImmutable = MakeSyncImmutable;
    var SyncNode = (function () {
        function SyncNode(obj) {
            this.listeners = [];
            this.immutable = Utils.makeImmutable(obj);
        }
        SyncNode.prototype.get = function () {
            return this.immutable;
        };
        SyncNode.prototype.notify = function (updated) {
            this.listeners.map(function (callback) {
                callback(updated);
            });
        };
        SyncNode.prototype.onUpdated = function (callback) {
            this.listeners.push(callback);
        };
        SyncNode.prototype.set = function (key, value) {
            if (this.immutable[key] !== value) {
                console.log('Doing set: ' + key, value, this.immutable);
                var lastModified = new Date().toISOString();
                var copy = Utils.copyRefsExceptForProp(this.immutable, key);
                var immutableValue = Utils.makeImmutable(value);
                copy[key] = immutableValue;
                copy['lastModified'] = lastModified;
                Object.freeze(copy);
                this.immutable = copy;
                this.notify(this.get());
                return this.get();
            }
            else {
                console.log('Skipping set: ', key, value, this.immutable);
                return this.get();
            }
        };
        SyncNode.prototype.setByPath = function (keys, value) {
            var currKey = keys[0];
            if (keys.length === 1) {
                this.set(currKey, value);
            }
            else {
                var next = this.immutable[currKey];
                if (next === undefined) {
                    var newMe = this.set(currKey, {});
                    console.log(currKey, 'newMe: ', newMe);
                    next = newMe[currKey];
                }
                next.__.setByPath(keys.splice(1, keys.length - 1), value);
            }
        };
        return SyncNode;
    })();
    exports.SyncNode = SyncNode;
});
//# sourceMappingURL=SyncedObject.js.map