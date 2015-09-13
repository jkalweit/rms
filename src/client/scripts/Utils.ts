import Models = require('./Models');

export function toArray<T>(obj: { [key: string]: T }, sortField: string = 'key', ignoreProps: string[] = ['lastModified']) {
    var array: T[] = [];

    if (obj && typeof obj === 'object') {
        Object.keys(obj).forEach((key: string) => {
            if (ignoreProps.indexOf(key) === -1) {
                array.push(obj[key]);
            }
        });

        if(sortField) {
          array.sort((a: T, b: T): number => {
            if(a[sortField] < b[sortField]) return -1;
            if(a[sortField] > b[sortField]) return 1;
            return 0;
          });
        }
    }

    return array;
}

export function formatCurrency(value: any, precision: number = 2): string {
  var number = (typeof value === 'string') ? parseInt(value) : value as number;
  return number.toFixed(precision);
}


export interface TicketItemTotals {
  total: number;
}
export function ticketItemTotals(item: Models.TicketItem): TicketItemTotals {
    var totals = { food: 0, tax: 0, bar: 0, total: 0 };
    var subTotal = item.quantity * item.price;
    if(item.type === 'Food')
    totals.total = item.price * item.quantity;
    return totals;
}

export interface TicketTotals {
  food: number;
  tax: number;
  bar: number;
  total: number;
}
export function ticketTotals(ticket: Models.Ticket): TicketTotals {
    var totals = { food: 0, tax: 0, bar: 0, total: 0 };
    var items = toArray<Models.TicketItem>(ticket.items);
    items.forEach((item: Models.TicketItem) => {
      totals.food += ticketItemTotals(item).total;
    });
    return totals;
}


export function snapToGrid(val: number, grid: number) {
    var offset = val % grid;
    if (offset < (grid / 2))
        return val - offset;
    else
        return val + (grid - offset);
}
