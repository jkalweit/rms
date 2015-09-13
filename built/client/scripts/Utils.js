define(["require", "exports"], function (require, exports) {
    function toArray(obj, sortField, ignoreProps) {
        if (sortField === void 0) { sortField = 'key'; }
        if (ignoreProps === void 0) { ignoreProps = ['lastModified']; }
        var array = [];
        if (obj && typeof obj === 'object') {
            Object.keys(obj).forEach(function (key) {
                if (ignoreProps.indexOf(key) === -1) {
                    array.push(obj[key]);
                }
            });
            if (sortField) {
                array.sort(function (a, b) {
                    if (a[sortField] < b[sortField])
                        return -1;
                    if (a[sortField] > b[sortField])
                        return 1;
                    return 0;
                });
            }
        }
        return array;
    }
    exports.toArray = toArray;
    function formatCurrency(value, precision) {
        if (precision === void 0) { precision = 2; }
        var number = (typeof value === 'string') ? parseInt(value) : value;
        return number.toFixed(precision);
    }
    exports.formatCurrency = formatCurrency;
    function ticketItemTotals(item) {
        var totals = { food: 0, tax: 0, bar: 0, total: 0 };
        var subTotal = item.quantity * item.price;
        if (item.type === 'Food')
            totals.total = item.price * item.quantity;
        return totals;
    }
    exports.ticketItemTotals = ticketItemTotals;
    function ticketTotals(ticket) {
        var totals = { food: 0, tax: 0, bar: 0, total: 0 };
        var items = toArray(ticket.items);
        items.forEach(function (item) {
            totals.food += ticketItemTotals(item).total;
        });
        return totals;
    }
    exports.ticketTotals = ticketTotals;
    function snapToGrid(val, grid) {
        var offset = val % grid;
        if (offset < (grid / 2))
            return val - offset;
        else
            return val + (grid - offset);
    }
    exports.snapToGrid = snapToGrid;
});
//# sourceMappingURL=Utils.js.map