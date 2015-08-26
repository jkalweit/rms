/// <reference path='./typings/tsd.d.ts' />
var Persistence = require('./Persistence');
var Response = (function () {
    function Response(requestGuid, data) {
        this.requestGuid = requestGuid;
        this.stamp = new Date();
        this.data = data;
    }
    return Response;
})();
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
                    socket.emit('latest', _this.data);
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
                    if (key === 'lastModified' && obj[key] > merge[key]) {
                        console.error('Server version lastModified GREATER THAN merge lastModified', obj[key], merge[key]);
                    }
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
            socket.on('update', function (request) {
                var merge = request.data;
                doMerge(_this.data, merge);
                _this.persistence.persist(_this.data);
                socket.emit('updateResponse', new Response(request.requestGuid, null));
                socket.broadcast.emit('update', merge);
            });
        });
    };
    return SyncNodeServer;
})();
exports.SyncNodeServer = SyncNodeServer;
//# sourceMappingURL=SyncNodeServer.js.map