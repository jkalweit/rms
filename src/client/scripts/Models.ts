/// <reference path="./typings/tsd.d.ts" />


export interface Reconciliation {
    modified: Date;
    name: string;
    menu: Menu;
    tickets: {[key: string]: Ticket};
}
export interface Menu {
    categories: {[key: string]: MenuCategory};
}
export interface MenuCategory {
    key: string;
    type: string;
    name: string;
    note: string;
    items: {[key: string]: MenuItem};
}
export interface MenuItem {
    key: string;
    name: string;
    price: number;
}



export interface Ticket {
    key: string;
    name: string;
}
