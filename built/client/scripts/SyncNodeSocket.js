/// <reference path="./typings/tsd.d.ts" />
define(["require", "exports", 'socket.io', './SyncNode'], function (require, exports, io, SyncNode) {
    "use strict";
    var SyncNodeSocket = (function () {
        function SyncNodeSocket(path) {
            var _this = this;
            this.listeners = [];
            if (!(path[0] === '/'))
                path = '/' + path;
            this.path = path;
            var syncObject = JSON.parse(localStorage.getItem(this.path)) || { local: {} };
            this.syncNode = SyncNode.MakeSyncNode(syncObject);
            this.syncNode.__.onUpdated(function (updated) {
                _this.syncNode = updated;
                console.log('syncNode updated!!!!', _this.syncNode);
                localStorage.setItem(_this.path, JSON.stringify(_this.syncNode));
                _this.notify();
            });
            var socketHost = 'http://' + location.host + path;
            console.log('Connecting to namespace: \'' + socketHost + '\'');
            this.server = io(socketHost);
            this.server.emit('getLatest', syncObject.local.lastModified);
            this.server.on('updated', function (updated) {
                var updatedObj = JSON.parse(updated);
                console.log('handle update: ', updatedObj);
                _this.syncNode.set('local', updatedObj);
            });
        }
        SyncNodeSocket.prototype.onUpdated = function (callback) {
            this.listeners.push(callback);
        };
        SyncNodeSocket.prototype.notify = function () {
            var _this = this;
            this.listeners.forEach(function (callback) {
                callback(_this.get());
            });
        };
        SyncNodeSocket.prototype.get = function () {
            return this.syncNode['local'];
        };
        return SyncNodeSocket;
    })();
    exports.SyncNodeSocket = SyncNodeSocket;
});
//# sourceMappingURL=SyncNodeSocket.js.map