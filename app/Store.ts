/// <reference path="../typings/tsd.d.ts" />
/// <reference path="./Models.ts" />

import io = require('socket.io');
import Freezer = require('freezer-js');
import models = require('./Models');



var reconciliationStore = new Freezer<models.Reconciliation>(
    JSON.parse(localStorage.getItem('rec'))
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


class Store {
    socket: SocketIO.Server;
    reconciliation: models.Reconciliation;
    onChanged: (updated) => void;
    notifyQueue: any[] = [];
    constructor() {
        console.log('Initializing Store.');

        var socketHost = 'http://' + location.host + '/reconciliation';
        console.log('Connecting to namespace: \'' + socketHost + '\'');
        this.socket = io(socketHost);

        this.socket.on('insertTicket', (data: any) => {
            console.log('insertTicket', data);
            this.setHelper(this.reconciliation.tickets, data, null);
        });

        reconciliationStore.on('update', () => {
            this.reconciliation = reconciliationStore.get();
            localStorage.setItem('rec', JSON.stringify(this.reconciliation.toJS()));
            if (this.onChanged) this.onChanged(this.reconciliation);
            console.log('updated, doing notifyQueue');
            this.notifyQueue.map((callback) => {
                console.log('notifying!')
                callback();
            });
            this.notifyQueue = [];
        });

        this.reconciliation = reconciliationStore.get();
    }

    insertTicket(ticket: models.TicketModel, callback?: (ticket: models.TicketModel) => void): models.TicketModel {
        this.socket.emit('insertTicket', ticket);
        var immutable = this.setHelper(this.reconciliation.tickets, ticket, callback);
        return immutable;
    }

    menuCategoryInsert(category: models.MenuCategoryModel, callback?: (category: models.MenuCategoryModel) => void): models.MenuCategoryModel {
        return this.setHelper(this.reconciliation.menu.categories, category, callback);
    }
    menuCategoryUpdate(category: models.MenuCategoryModel, callback?: (category: models.MenuCategoryModel) => void): models.MenuCategoryModel {
        return this.setHelper(this.reconciliation.menu.categories, category, callback);
    }
    menuCategoryRemove(key: string, callback?: () => void) {
        this.reconciliation.menu.categories.remove(key);
        if (callback) {
            this.notifyQueue.push(() => { callback(); });
        }
    }

    menuItemInsert(category: models.MenuCategoryModel, item: models.MenuItemModel, callback?: (item: models.MenuItemModel) => void): models.MenuItemModel {
        return this.setHelper(category.items, item, callback);
    }
    menuItemUpdate(category: models.MenuCategoryModel, item: models.MenuItemModel, callback?: (item: models.MenuItemModel) => void): models.MenuItemModel {
        return this.setHelper(category.items, item, callback);
    }
    menuItemRemove(category: models.MenuCategoryModel, key: string, callback?: () => void) {
        console.log('about to remove');
        category.items.remove(key);
        console.log('removed');
        if (callback) {
            console.log('queueing callback');
            this.notifyQueue.push(() => { console.log('doing callback'); callback(); });
        }
    }







    setHelper(map: any, object: any, callback: (immutable: any) => void): any {
        var newMapImmutable = map.set(object.key, object);
        var immutable = newMapImmutable[object.key];
        if (callback) {
            this.notifyQueue.push(() => { callback(immutable); });
        }
        return immutable;
    }
}

var store = new Store();
export = store;
