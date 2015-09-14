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
        var totals = { Food: 0, Alcohol: 0, subTotal: 0, tax: 0, total: 0 };
        totals.subTotal = roundToTwo(item.quantity * item.price);
        totals.tax = roundToTwo(totals.subTotal * (item.tax ? item.tax : 0));
        totals.total = totals.subTotal + totals.tax;
        return totals;
    }
    exports.ticketItemTotals = ticketItemTotals;
    function ticketTotals(ticket) {
        var totals = { Food: 0, Alcohol: 0, tax: 0, total: 0 };
        var items = toArray(ticket.items);
        items.forEach(function (item) {
            var itemTotals = ticketItemTotals(item);
            totals[item.type] += itemTotals.subTotal;
            totals.tax += itemTotals.tax;
            totals.total += itemTotals.total;
        });
        return totals;
    }
    exports.ticketTotals = ticketTotals;
    function roundToTwo(num) {
        return +(Math.round((num.toString() + 'e+2')) + "e-2");
    }
    exports.roundToTwo = roundToTwo;
    function snapToGrid(val, grid) {
        var offset = val % grid;
        if (offset < (grid / 2))
            return val - offset;
        else
            return val + (grid - offset);
    }
    exports.snapToGrid = snapToGrid;
    function arrayContains(list, value) {
        for (var i = 0; i < list.length; ++i) {
            if (list[i] === value)
                return true;
        }
        return false;
    }
    exports.arrayContains = arrayContains;
});
//# sourceMappingURL=Utils.js.map