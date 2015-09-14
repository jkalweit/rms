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
  subTotal: number;
  tax: number;
  total: number;
}
export function ticketItemTotals(item: Models.TicketItem): TicketItemTotals {
    var totals = { Food: 0, Alcohol: 0, subTotal: 0, tax: 0, total: 0 };
    totals.subTotal = roundToTwo(item.quantity * item.price);

    totals.tax = roundToTwo(totals.subTotal * (item.tax ? item.tax : 0));
    totals.total = totals.subTotal + totals.tax;

    return totals;
}

export interface TicketTotals {
  Food: number;
  Alcohol: number;
  tax: number;
  total: number;
}
export function ticketTotals(ticket: Models.Ticket): TicketTotals {
    var totals = { Food: 0, Alcohol: 0, tax: 0, total: 0 };
    var items = toArray<Models.TicketItem>(ticket.items);
    items.forEach((item: Models.TicketItem) => {
      var itemTotals = ticketItemTotals(item);
      totals[item.type] += itemTotals.subTotal;
      totals.tax += itemTotals.tax;
      totals.total += itemTotals.total;
    });
    return totals;
}

export function roundToTwo(num: number) {
    return +(Math.round((num.toString() + 'e+2') as any)  + "e-2");
}

export function snapToGrid(val: number, grid: number) {
    var offset = val % grid;
    if (offset < (grid / 2))
        return val - offset;
    else
        return val + (grid - offset);
}

export function arrayContains(list: string[], value: string)
{
    console.log('    here', value);
    for( var i = 0; i < list.length; ++i )
    {
        console.log(i, list[i]);
        if(list[i] === value) return true;
    }

    return false;
}
