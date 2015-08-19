/// <reference path='./typings/tsd.d.ts' />
define(["require", "exports"], function (require, exports) {
    var Logger = (function () {
        function Logger() {
            this.items = [];
            this.listeners = [];
        }
        Logger.prototype.onItemsChanged = function (callback) {
            this.listeners.push(callback);
        };
        Logger.prototype.debug = function (path, message) {
            this.log(path, message, 'debug');
        };
        Logger.prototype.error = function (path, message) {
            this.log(path, message, 'error');
        };
        Logger.prototype.log = function (path, message, type) {
            var _this = this;
            if (type === void 0) { type = 'log'; }
            var newItem = { stamp: new Date().toLocaleString(), path: path, message: message, type: type };
            this.items = [newItem].concat(this.items);
            this.listeners.forEach(function (callback) {
                callback(_this.items);
            });
        };
        return Logger;
    })();
    exports.Log = new Logger();
});
//# sourceMappingURL=Logger.js.map