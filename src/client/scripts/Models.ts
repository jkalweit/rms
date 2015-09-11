/// <reference path="./typings/tsd.d.ts" />

export interface ISyncObject {
    __syncNodeId?: number;
    lastModified?: string;
}




export interface FlowDiagrams extends ISyncObject {
    diagrams: {[key: string]: FlowDiagram};
}
export interface FlowDiagram extends ISyncObject {
    key: string;
    name: string;
    items: { [key: string]: FlowDiagramItem };
    arrows: { [key: string]: FlowDiagramArrow };
}
export interface FlowDiagramItem extends ISyncObject {
    key: string;
    text: string;
    position: {x: number, y: number};
    width: number;
    height: number;
}

export interface FlowDiagramArrow extends ISyncObject {
    key: string;
    position: {x: number, y: number};
    width: number;
    height: number;
    text: string;
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
    defaultTax?: number;
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
    items?: {[key: string]: TicketItem};
    isPaid?: boolean;
}

export interface TicketItem extends ISyncObject {
    key?: string;
    name?: string;
    price?: number;
    quantity?: number;
    note?: string;
}

export interface  Kitchen {
    orders?: {[key: string]: KitchenOrder};
}
export interface KitchenOrder extends ISyncObject {
    key?: string;
    name?: string;
    isTogo?: boolean;
    submittedAt?: Date;
    completedAt?: Date;
    clearedAt?: Date;
    items?: {[key: string]: KitchenOrderItem}
}
export interface KitchenOrderItem extends ISyncObject {
    key?: string;
    description?: string;
    note?: string;
    type?: string;
    prepType?: string;
    quantity?: number;
    options?: {[key: string]: KitchenOrderItemOption}
}
export interface KitchenOrderItemOption extends ISyncObject {
    key?: string;
    description?: string;
    type?: string;
    prepType?: string;
}
