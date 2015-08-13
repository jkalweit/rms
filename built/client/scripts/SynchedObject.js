/// <reference path="./typings/tsd.d.ts" />
define(["require", "exports"], function (require, exports) {
    var SyncNotifiers = (function () {
        function SyncNotifiers(obj) {
            this.listeners = [];
            this.obj = obj;
        }
        SyncNotifiers.prototype.notify = function (updated) {
            this.listeners.map(function (callback) {
                console.log('doing callback');
                callback(updated);
            });
        };
        SyncNotifiers.prototype.onUpdated = function (callback) {
            this.listeners.push(callback);
        };
        SyncNotifiers.prototype.get = function () {
            return this.obj;
        };
        SyncNotifiers.prototype.set = function (key, value) {
            console.log('here');
            if (this.obj[key] !== value) {
                console.log('Doing set: ' + key, value, this.obj);
                this.obj[key] = value;
                var lastModified = new Date().toISOString();
                if (typeof value === 'object' && !value.hasOwnProperty('lastModified')) {
                    value.lastModified = lastModified;
                }
                this.obj.lastModified = lastModified;
                console.log('upateding last modified: ', this.obj.lastModified);
                this.notify(this.get());
            }
            else {
                console.log('Skipping set: ', key, value, this.obj);
            }
        };
        SyncNotifiers.prototype.setByPath = function (keys, value) {
            var _this = this;
            console.log('keys: ', keys);
            if (keys.length === 1) {
                this.set(keys[0], value);
            }
            else {
                var next = this.obj[keys[0]];
                if (next === undefined) {
                    next = {};
                    SyncNotifiers.addNotifiers(next, function (updated) {
                        _this.obj.lastModified = updated.lastModified;
                        _this.notify(_this.get());
                    });
                    this.obj[keys[0]] = next;
                }
                next.__.setByPath(keys.splice(1, keys.length - 1), value);
            }
        };
        SyncNotifiers.addNotifiers = function (obj, updateCallback) {
            if (typeof obj !== 'object')
                return;
            if (obj.hasOwnProperty('__'))
                return;
            var childUpdateCallback = function (updated) {
                obj.lastModified = updated.lastModified;
                obj.__.notify(obj.__.get());
            };
            var propNames = Object.getOwnPropertyNames(obj);
            propNames.forEach(function (name) {
                var prop = obj[name];
                SyncNotifiers.addNotifiers(prop, childUpdateCallback);
            });
            var notifiers = new SyncNotifiers(obj);
            Object.defineProperty(obj, '__', {
                enumerable: false,
                configurable: true,
                writable: true,
                value: notifiers
            });
            if (updateCallback) {
                obj.__.onUpdated(updateCallback);
            }
        };
        return SyncNotifiers;
    })();
    exports.SyncNotifiers = SyncNotifiers;
    var SyncedObject = (function () {
        function SyncedObject(path) {
            var mutable = JSON.parse(localStorage.getItem(path)) || { name: 'Hallo Rec', lastModified: new Date().toISOString() };
            this.__ = new SyncNotifiers(mutable);
            SyncNotifiers.addNotifiers(mutable, null);
            console.log('Mutable: ', mutable);
        }
        SyncedObject.prototype.get = function () {
            return this.__.get();
        };
        SyncedObject.prototype.setByPath = function (key, value) {
            console.log('Setting by path: ' + key, value);
            console.log('Before: ', this.__.obj);
            var keySplit = key.split('.');
            this.__.setByPath(keySplit, value);
            console.log('After: ', this.__.obj);
        };
        return SyncedObject;
    })();
    exports.SyncedObject = SyncedObject;
});
//# sourceMappingURL=SynchedObject.js.map