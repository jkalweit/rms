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
    var totals = { total: 0 };
    totals.total = item.price * item.quantity;
    return totals;
}

export interface TicketTotals {
  total: number;
}
export function ticketTotals(ticket: Models.Ticket): TicketTotals {
    var totals = { total: 0 };
    var items = toArray<Models.TicketItem>(ticket.items);
    items.forEach((item: Models.TicketItem) => {
      totals.total += ticketItemTotals(item).total;
    });
    return totals;
}
