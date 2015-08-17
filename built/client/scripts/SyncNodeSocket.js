/// <reference path="./typings/tsd.d.ts" />
define(["require", "exports", 'socket.io', './SyncNode'], function (require, exports, io, Sync) {
    "use strict";
    var SyncNodeSocket = (function () {
        function SyncNodeSocket(path, defaultObject) {
            var _this = this;
            this.listeners = [];
            this.updatesDisabled = false;
            this.status = 'Initializing...';
            if (!(path[0] === '/'))
                path = '/' + path;
            this.path = path;
            var localCached = JSON.parse(localStorage.getItem(this.path));
            this.syncNode = new Sync.SyncNode({ local: localCached || defaultObject });
            Sync.SyncNode.addNE(this.syncNode, 'onUpdated', this.createOnUpdated(this));
            var socketHost = 'http://' + location.host + path;
            console.log('Connecting to namespace: \'' + socketHost + '\'');
            this.server = io(socketHost);
            this.server.on('update', function (merge) {
                var mergeObj = JSON.parse(merge);
                console.log('*************handle update: ', mergeObj);
                _this.updatesDisabled = true;
                _this.syncNode['local'].merge(mergeObj);
                _this.updatesDisabled = false;
                _this.updateStatus('Received update - last modified: ' + mergeObj.lastModified);
            });
            this.server.on('latest', function (latest) {
                var latestObj = JSON.parse(latest);
                console.log('handle latest: ', latestObj);
                _this.updatesDisabled = true;
                _this.syncNode.set('local', latestObj);
                _this.updatesDisabled = false;
                _this.updateStatus('Received latest - last modified: ' + latestObj.lastModified);
            });
            this.server.emit('getLatest', this.get()['lastModified']);
        }
        SyncNodeSocket.prototype.updateStatus = function (status) {
            this.status = status;
            if (this.onStatusChanged)
                this.onStatusChanged(this.path, this.status);
        };
        SyncNodeSocket.prototype.createOnUpdated = function (node) {
            var _this = this;
            return function (updated, action, path, merge) {
                Sync.SyncNode.addNE(updated, 'onUpdated', _this.createOnUpdated(_this));
                _this.syncNode = updated;
                localStorage.setItem(_this.path, JSON.stringify(_this.get()));
                if (!_this.updatesDisabled) {
                    _this.server.emit('update', JSON.stringify(merge.local));
                }
                _this.notify();
            };
        };
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