/// <reference path="./typings/tsd.d.ts" />

import moment = require('moment');



export interface FreezerObject<T> {
    get?: () => T;
    set?: (key: string, val: any) => void;
    toJS?: () => T;
}
export interface FreezerHash<T> extends FreezerObject<T> {
    set?: (key: string, val: T) => FreezerHash<T>;
    remove?: (key: string) => FreezerHash<T>;
}
export interface Reconciliation extends FreezerObject<Reconciliation> {
    menu: MenuModel;
    tickets: FreezerHash<TicketModel>;
}
export interface MenuModel extends FreezerObject<MenuModel> {
    categories: FreezerHash<MenuCategoryModel>;
}
export interface MenuCategoryModel extends FreezerObject<MenuCategoryModel> {
    key: string;
    type: string;
    name: string;
    note: string;
    items: FreezerHash<MenuItemModel>;
}
export interface MenuItemModel extends FreezerObject<MenuItemModel> {
    key: string;
    name: string;
    price: number;
}



export interface TicketModel extends FreezerObject<TicketModel> {
    key: string;
    name: string;
}





/*export class DbObjectModel {
    _id: string;
    created: Date;
    lastModified: Date;
    static collectionName: string;
}*/

/*
export class InventoryItemModel extends DbObjectModel {
    name: string;
    note: string;
    count: number;
    static collectionName: string = 'inventory_items';
}

export class VendorModel extends DbObjectModel {
    name: string;
    note: string;
    static collectionName: string = 'vendors';
}


export class ShiftModel extends DbObjectModel {
    date: Date
    start: string;
    end: string;
    positions: ShiftPositionModel[];
    static collectionName: string = 'shifts';

    static shiftLength(shift: ShiftModel|ShiftPositionModel) : any {
      var start = moment(shift.date);
      var end = moment(shift.date);
      if(shift.start && shift.end) {
        var startSplit = shift.start.split(':');
        var endSplit = shift.end.split(':');
        start.hour(startSplit[0] as any);
        start.minute(startSplit[1] as any);
        end.hour(endSplit[0] as any);
        end.minute(endSplit[1] as any);
        if(end.diff(start) < 0) { end.add(1, 'days'); };
      }
      var diff = moment.duration(end.diff(start));
      return diff.hours() + ":" + ('0' + diff.minutes()).slice(-2);
    }
}

*/
/*
export class ShiftPositionModel {
    name: string;
    employee: string;
    date: Date;
    start: string;
    end: string;
    static collectionName: string = 'shifts.position';
}
*/
/*
export class KitchenOrderModel extends DbObjectModel {
    name: string;
    isTogo: boolean;
    location: string;
    submittedAt: Date;
    acknowledgedAt: Date;
    completedAt: Date;
    static collectionName: string = 'kitchen_orders';
}





export interface MenuCategoryModel {
    _id?: string;
    type?: string;
    name?: string;
    note?: string;
    menuItems: MenuItemModel[];
}

export interface MenuItemModel {
  _id?: string;
  name?: string;
  note?: string;
  price?: number;
}











export interface ReconciliationModel {
  _id: string;
  name: string = 'Dinner;
  date: Date;
  tickets: TicketModel[];
}*/
