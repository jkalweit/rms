/// <reference path="../typings/tsd.d.ts" />
/// <reference path="./Models.ts" />
define(["require", "exports", 'socket.io', 'freezer-js'], function (require, exports, io, Freezer) {
    var reconciliationStore = new Freezer(JSON.parse(localStorage.getItem('rec'))
        || {
            tickets: {},
            menu: {
                categories: {
                    '0': {
                        key: '0',
                        name: 'Dinner Entrees',
                        items: {
                            '0': {
                                key: '0',
                                name: '14oz Ribeye',
                                price: 20
                            },
                            '1': {
                                key: '1',
                                name: 'Cajun Chicken',
                                price: 14
                            },
                            '2': {
                                key: '2',
                                name: 'Chicken Tenders',
                                price: 10
                            }
                        }
                    }
                }
            }
        }, { live: false });
    var Store = (function () {
        function Store() {
            var _this = this;
            this.notifyQueue = [];
            console.log('Initializing Store.');
            var socketHost = 'http://' + location.host + '/reconciliation';
            console.log('Connecting to namespace: \'' + socketHost + '\'');
            this.socket = io(socketHost);
            this.socket.on('insertTicket', function (data) {
                console.log('insertTicket', data);
                _this.setHelper(_this.reconciliation.tickets, data, null);
            });
            reconciliationStore.on('update', function () {
                _this.reconciliation = reconciliationStore.get();
                localStorage.setItem('rec', JSON.stringify(_this.reconciliation.toJS()));
                if (_this.onChanged)
                    _this.onChanged(_this.reconciliation);
                console.log('updated, doing notifyQueue');
                _this.notifyQueue.map(function (callback) {
                    console.log('notifying!');
                    callback();
                });
                _this.notifyQueue = [];
            });
            this.reconciliation = reconciliationStore.get();
        }
        Store.prototype.insertTicket = function (ticket, callback) {
            this.socket.emit('insertTicket', ticket);
            var immutable = this.setHelper(this.reconciliation.tickets, ticket, callback);
            return immutable;
        };
        Store.prototype.menuCategoryInsert = function (category, callback) {
            return this.setHelper(this.reconciliation.menu.categories, category, callback);
        };
        Store.prototype.menuCategoryUpdate = function (category, callback) {
            return this.setHelper(this.reconciliation.menu.categories, category, callback);
        };
        Store.prototype.menuCategoryRemove = function (key, callback) {
            this.reconciliation.menu.categories.remove(key);
            if (callback) {
                this.notifyQueue.push(function () { callback(); });
            }
        };
        Store.prototype.menuItemInsert = function (category, item, callback) {
            return this.setHelper(category.items, item, callback);
        };
        Store.prototype.menuItemUpdate = function (category, item, callback) {
            return this.setHelper(category.items, item, callback);
        };
        Store.prototype.menuItemRemove = function (category, key, callback) {
            console.log('about to remove');
            category.items.remove(key);
            console.log('removed');
            if (callback) {
                console.log('queueing callback');
                this.notifyQueue.push(function () { console.log('doing callback'); callback(); });
            }
        };
        Store.prototype.setHelper = function (map, object, callback) {
            var newMapImmutable = map.set(object.key, object);
            var immutable = newMapImmutable[object.key];
            if (callback) {
                this.notifyQueue.push(function () { callback(immutable); });
            }
            return immutable;
        };
        return Store;
    })();
    var store = new Store();
    return store;
});
//# sourceMappingURL=Store.js.map