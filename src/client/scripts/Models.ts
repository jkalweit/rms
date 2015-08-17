/// <reference path="./typings/tsd.d.ts" />

export interface ISyncObject {
    __syncNodeId?: number;
    lastModified?: string;
}

export interface Reconciliation extends ISyncObject {
    name?: string;
    menu?: Menu;
    tickets?: {[key: string]: Ticket};
}
export interface Menu extends ISyncObject {
    categories?: {[key: string]: MenuCategory};
}
export interface MenuCategory extends ISyncObject {
    key?: string;
    type?: string;
    name?: string;
    note?: string;
    items?: {[key: string]: MenuItem};
}
export interface MenuItem extends ISyncObject {
    key?: string;
    name?: string;
    price?: number;
}

export interface Ticket extends ISyncObject {
    key?: string;
    name?: string;
}
