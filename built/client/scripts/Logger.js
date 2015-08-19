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
        Logger.prototype.addItem = function (path, message) {
            var _this = this;
            var newItem = { stamp: new Date().toLocaleString(), path: path, message: message };
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