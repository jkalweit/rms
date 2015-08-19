/// <reference path='./typings/tsd.d.ts' />
var Persistence = require('./Persistence');
var SyncNodeServer = (function () {
    function SyncNodeServer(namespace, io, defaultData) {
        var _this = this;
        if (defaultData === void 0) { defaultData = {}; }
        this.namespace = namespace;
        this.io = io;
        this.persistence = new Persistence.FilePersistence(namespace, 'data\\');
        this.persistence.get(function (data) {
            _this.data = data || defaultData;
            _this.start();
        });
    }
    SyncNodeServer.prototype.start = function () {
        var _this = this;
        this.ioNamespace = this.io.of('/' + this.namespace);
        this.ioNamespace.on('connection', function (socket) {
            console.log('someone connected to ' + _this.namespace);
            socket.on('getLatest', function (clientLastModified) {
                console.log('getLatest', _this.data.lastModified, clientLastModified);
                if (!clientLastModified || clientLastModified < _this.data.lastModified) {
                    console.log('sending latest', _this.data);
                    socket.emit('latest', JSON.stringify(_this.data));
                }
                else {
                    console.log('already has latest.');
                    socket.emit('latest', null);
                }
            });
            function doMerge(obj, merge) {
                if (typeof merge !== 'object')
                    return merge;
                Object.keys(merge).forEach(function (key) {
                    if (key === '__remove') {
                        delete obj[merge[key]];
                    }
                    else {
                        var nextObj = obj[key] || {};
                        obj[key] = doMerge(nextObj, merge[key]);
                    }
                });
                return obj;
            }
            socket.on('update', function (merge) {
                var mergeObj = JSON.parse(merge);
                console.log('Do merge: ', mergeObj);
                doMerge(_this.data, mergeObj);
                _this.persistence.persist(_this.data);
                socket.broadcast.emit('update', merge);
            });
        });
    };
    return SyncNodeServer;
})();
exports.SyncNodeServer = SyncNodeServer;
//# sourceMappingURL=SyncNodeServer.js.map