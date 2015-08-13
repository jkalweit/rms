/// <reference path="../typings/tsd.d.ts" />
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", 'socket.io'], function (require, exports, io) {
    function guid() {
        function s4() {
            return Math.floor((1 + Math.random()) * 0x10000)
                .toString(16)
                .substring(1);
        }
        return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
    }
    exports.guid = guid;
    var Request = (function () {
        function Request() {
        }
        return Request;
    })();
    exports.Request = Request;
    var DataStoreBase = (function () {
        function DataStoreBase(collectionName) {
            this.collectionName = collectionName;
            this.subscriptions = {};
        }
        DataStoreBase.prototype.query = function () { };
        DataStoreBase.prototype.insert = function (data) { };
        DataStoreBase.prototype.update = function (data) { };
        DataStoreBase.prototype.remove = function (id) { };
        DataStoreBase.prototype.init = function () { };
        DataStoreBase.prototype.notifySubscribers = function (event, params) {
            this.subscriptions[event] = this.subscriptions[event] || [];
            this.subscriptions[event].map(function (subscriber) {
                subscriber(params);
            });
        };
        DataStoreBase.prototype.on = function (event, callback) {
            this.subscriptions[event] = this.subscriptions[event] || [];
            this.subscriptions[event].push(callback);
        };
        return DataStoreBase;
    })();
    exports.DataStoreBase = DataStoreBase;
    var LocalPersistence = (function (_super) {
        __extends(LocalPersistence, _super);
        function LocalPersistence() {
            _super.apply(this, arguments);
        }
        LocalPersistence.prototype.init = function () {
            var fromStorage = localStorage.getItem(this.collectionName);
            this.collection = JSON.parse(fromStorage) || {};
        };
        LocalPersistence.prototype.setCollection = function (data) {
            var _this = this;
            this.collection = {};
            data.forEach(function (item) {
                _this.collection[item._id] = item;
            });
            this.persist();
        };
        LocalPersistence.prototype.query = function () {
            var result = [];
            for (var id in this.collection) {
                result.push(this.collection[id]);
            }
            this.notifySubscribers('queryed', result);
        };
        LocalPersistence.prototype.insert = function (data) {
            this.notifySubscribers('inserted', this.upsertHelper(data));
        };
        LocalPersistence.prototype.update = function (data) {
            this.notifySubscribers('updated', this.upsertHelper(data));
        };
        LocalPersistence.prototype.upsertHelper = function (data) {
            if (!data._id) {
                data._id = guid();
            }
            if (!data.created) {
                data.created = new Date();
            }
            data.lastModified = new Date();
            this.collection[data._id] = data;
            this.persist();
            return data;
        };
        LocalPersistence.prototype.remove = function (id) {
            delete this.collection[id];
            this.persist();
            this.notifySubscribers('removed', id);
        };
        LocalPersistence.prototype.persist = function () {
            var stringified = JSON.stringify(this.collection);
            localStorage.setItem(this.collectionName, stringified);
        };
        return LocalPersistence;
    })(DataStoreBase);
    exports.LocalPersistence = LocalPersistence;
    var SocketIODataStore = (function (_super) {
        __extends(SocketIODataStore, _super);
        function SocketIODataStore(collectionName) {
            var _this = this;
            _super.call(this, collectionName);
            this.openRequests = {};
            this.local = new LocalPersistence(collectionName);
            this.local.on('queryed', function (data) { _this.notifySubscribers('queryed', data); });
            this.local.on('inserted', function (data) { _this.notifySubscribers('inserted', data); });
            this.local.on('updated', function (data) { _this.notifySubscribers('updated', data); });
            this.local.on('removed', function (data) { _this.notifySubscribers('removed', data); });
            window.onbeforeunload = function (e) {
                if (Object.keys(_this.openRequests).length > 0) {
                    _this.showOpenRequests();
                    return 'There are unsaved changes, exit anyway?';
                }
            };
            var socketHost = 'http://' + location.host + '/' + this.collectionName;
            console.log('Connecting to namespace: \'' + socketHost + '\'');
            this.socket = io(socketHost);
            this.socket.on('queryed', function (data) {
                _this.clearRequest(data.requestId);
                _this.local.setCollection(data.data);
                _this.notifySubscribers('queryed', data.data);
            });
            this.socket.on('inserted', function (data) {
                _this.clearRequest(data.requestId);
                _this.local.insert(data.data);
            });
            this.socket.on('updated', function (data) {
                _this.clearRequest(data.requestId);
                _this.local.update(data.data);
            });
            this.socket.on('removed', function (data) {
                _this.clearRequest(data.requestId);
                _this.local.remove(data.data);
            });
        }
        SocketIODataStore.prototype.init = function () {
            this.local.init();
            this.sendRequest('query', {});
        };
        SocketIODataStore.prototype.query = function () {
            this.local.query();
        };
        SocketIODataStore.prototype.insert = function (data) {
            this.local.insert(data);
            this.sendRequest('insert', data);
        };
        SocketIODataStore.prototype.update = function (data) {
            this.local.update(data);
            this.sendRequest('update', data);
        };
        SocketIODataStore.prototype.remove = function (id) {
            this.local.remove(id);
            this.sendRequest('remove', id);
        };
        SocketIODataStore.prototype.showOpenRequests = function () {
            console.log("Open Requests:");
            for (var id in this.openRequests) {
                console.log(id + ' = ' + JSON.stringify(this.openRequests[id]));
            }
        };
        SocketIODataStore.prototype.sendRequest = function (action, data) {
            var request = new Request();
            request.id = guid();
            request.initiatedAt = new Date();
            request.action = action;
            request.path = this.collectionName;
            request.data = data;
            this.openRequests[request.id] = request;
            this.socket.emit('crud', request);
        };
        SocketIODataStore.prototype.clearRequest = function (id) {
            delete this.openRequests[id];
        };
        return SocketIODataStore;
    })(DataStoreBase);
    exports.SocketIODataStore = SocketIODataStore;
});
//# sourceMappingURL=DataStores.js.map