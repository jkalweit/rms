/// <reference path="./typings/tsd.d.ts" />
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", 'react/addons', './BaseViews', './Menu', './Utils', './SmartInput'], function (require, exports, React, Base, Menu, Utils, SmartInputRef) {
    var SmartInput = SmartInputRef.SmartInput;
    var ReconciliationView = (function (_super) {
        __extends(ReconciliationView, _super);
        function ReconciliationView(props) {
            _super.call(this, props);
            this.name = 'ReconciliationView';
            this.state = {
                selectedTicket: null
            };
        }
        ReconciliationView.prototype.componentWillReceiveProps = function (nextProps) {
            if (nextProps.reconciliation.tickets !== this.props.reconciliation.tickets) {
                if (this.state.selectedTicket) {
                    this.setState({ selectedTicket: nextProps.reconciliation.tickets[this.state.selectedTicket.key] });
                }
            }
        };
        ReconciliationView.prototype.handleSelectTicket = function (ticket) {
            this.setState({ selectedTicket: ticket });
        };
        ReconciliationView.prototype.handleSelectMenuItem = function (item) {
            var ticket = this.state.selectedTicket;
            if (ticket) {
                var ticketItem = {
                    key: new Date().toISOString(),
                    name: item.name,
                    price: item.price,
                    tax: item.tax,
                    quantity: 1
                };
                ticket.items.set(ticketItem.key, ticketItem);
            }
        };
        ReconciliationView.prototype.render = function () {
            var _this = this;
            var classNames = this.preRender(['reconciliation']);
            return (React.createElement("div", {"className": classNames.join(' ')}, React.createElement(Tickets, {"tickets": this.props.reconciliation.tickets, "onSelectTicket": this.handleSelectTicket.bind(this), "selectedTicket": this.state.selectedTicket}), this.state.selectedTicket ? (React.createElement(TicketDetails, {"ticket": this.state.selectedTicket, "onRemove": function (ticket) { _this.props.reconciliation.tickets.remove(ticket.key); _this.setState({ selectedTicket: null }); }})) : null, React.createElement(Menu.Menu, {"menu": this.props.reconciliation.menu, "onItemSelected": this.handleSelectMenuItem.bind(this)})));
        };
        return ReconciliationView;
    })(Base.SyncView);
    exports.ReconciliationView = ReconciliationView;
    var Tickets = (function (_super) {
        __extends(Tickets, _super);
        function Tickets(props) {
            _super.call(this, props);
            this.name = '  Tickets';
            this.state = {
                showPaidTickets: false,
                filteredTickets: this.getFilteredTickets('', this.props.tickets),
                filter: ''
            };
        }
        Tickets.prototype.componentWillReceiveProps = function (nextProps, nextState) {
            if (nextProps.tickets !== this.props.tickets) {
                this.updateFilteredTickets(nextProps.tickets, this.filterInput.value);
            }
        };
        Tickets.prototype.handleFilterChanged = function (element, e) {
            var tickets = this.props.tickets;
            if (e.keyCode === 13) {
                var ticket = {
                    key: new Date().toISOString(),
                    name: e.target.value,
                    items: {}
                };
                e.target.value = '';
                var result = this.props.tickets.set(ticket.key, ticket);
                var newTickets = result.parentImmutable;
                this.props.onSelectTicket(result.value);
            }
            else {
                this.updateFilteredTickets(tickets, e.target.value);
            }
        };
        Tickets.prototype.updateFilteredTickets = function (tickets, filter) {
            var filteredTickets = this.getFilteredTickets(filter, tickets);
            this.setState({ filteredTickets: filteredTickets });
        };
        Tickets.prototype.getFilteredTickets = function (filter, tickets) {
            var _this = this;
            var normalized = filter.trim().toLowerCase();
            var ticketsArray = Utils.toArray(tickets);
            var filtered = ticketsArray.filter(function (ticket) {
                if (normalized.length === 0 || ticket.name.toLowerCase().indexOf(normalized) >= 0) {
                    return !ticket.isPaid || _this.state.showPaidTickets;
                }
                return false;
            });
            return filtered;
        };
        Tickets.prototype.toggleShowPaid = function () {
            var _this = this;
            this.setState({ showPaidTickets: !this.state.showPaidTickets }, function () {
                _this.updateFilteredTickets(_this.props.tickets, _this.filterInput.value);
            });
        };
        Tickets.prototype.render = function () {
            var _this = this;
            var classNames = this.preRender(['ticket-list']);
            var nodes = this.state.filteredTickets.map(function (ticket) {
                var isSelected = _this.props.selectedTicket === ticket;
                return (React.createElement(Ticket, {"key": ticket.key, "isSelected": isSelected, "ticket": ticket, "onSelect": function (ticket) { _this.props.onSelectTicket(ticket); }}));
            });
            return (React.createElement("div", {"className": classNames.join(' ')}, React.createElement("div", {"className": "btn", "onClick": function () { _this.toggleShowPaid(); }}, "Paid: ", this.state.showPaidTickets ? 'Shown' : 'Hidden'), React.createElement("input", {"className": "name-filter", "ref": function (el) {
                var input = React.findDOMNode(el);
                if (input) {
                    _this.filterInput = input;
                    input.focus();
                    input['onkeyup'] = function (e) {
                        _this.handleFilterChanged(input, e);
                    };
                }
            }}), React.createElement("ul", null, nodes)));
        };
        return Tickets;
    })(Base.SyncView);
    exports.Tickets = Tickets;
    var Ticket = (function (_super) {
        __extends(Ticket, _super);
        function Ticket() {
            _super.apply(this, arguments);
            this.name = '    TicketView';
        }
        Ticket.prototype.render = function () {
            var _this = this;
            var classNames = this.preRender();
            if (this.props.isSelected)
                classNames.push('active');
            var ticket = this.props.ticket;
            return (React.createElement("li", {"className": classNames.join(' '), "onClick": function () { _this.props.onSelect(ticket); }}, ticket.name));
        };
        return Ticket;
    })(Base.SyncView);
    exports.Ticket = Ticket;
    var TicketDetails = (function (_super) {
        __extends(TicketDetails, _super);
        function TicketDetails(props) {
            _super.call(this, props);
            this.name = '        TicketDetails';
            this.state = {
                selectedItem: null
            };
        }
        TicketDetails.prototype.render = function () {
            var _this = this;
            var classNames = this.preRender(['ticket-details']);
            var ticket = this.props.ticket;
            var items = Utils.toArray(ticket.items);
            var nodes = items.map(function (item) {
                return (React.createElement(TicketItem, {"key": item.key, "item": item, "onSelect": function (item) { _this.setState({ selectedItem: item }); _this.refs['ticketItemEditModal'].show(); }}));
            });
            var totals = Utils.ticketTotals(this.props.ticket);
            return (React.createElement("div", {"className": classNames.join(' ')}, React.createElement("h3", null, React.createElement(SmartInput, {"model": this.props.ticket, "modelProp": "name"}), React.createElement("button", {"onClick": function () { if (confirm('Remove?'))
                _this.props.onRemove(_this.props.ticket); }}, "X")), React.createElement("ul", null, nodes), React.createElement("div", {"className": "ticket-footer"}, React.createElement("button", {"onClick": function () { ticket.set('isPaid', !ticket.isPaid); }}, ticket.isPaid ? 'Paid' : 'Open'), React.createElement("div", {"className": "total"}, "Total: ", Utils.formatCurrency(totals.total))), React.createElement(Base.ModalView, {"ref": "ticketItemEditModal"}, this.state.selectedItem ? (React.createElement(TicketItemEdit, {"item": this.state.selectedItem, "onSave": function (item) {
                _this.props.ticket.items.set(item.key, item);
                _this.refs['ticketItemEditModal'].hide();
            }, "onCancel": function () {
                _this.refs['ticketItemEditModal'].hide();
            }, "onRemove": function (key) {
                _this.props.ticket.items.remove(key);
                _this.refs['ticketItemEditModal'].hide();
            }})) : null)));
        };
        return TicketDetails;
    })(Base.SyncView);
    exports.TicketDetails = TicketDetails;
    var TicketItem = (function (_super) {
        __extends(TicketItem, _super);
        function TicketItem() {
            _super.apply(this, arguments);
            this.name = '          TicketItem';
        }
        TicketItem.prototype.render = function () {
            var _this = this;
            var classNames = this.preRender();
            var item = this.props.item;
            return (React.createElement("li", {"className": classNames.join(' '), "onClick": function () { _this.props.onSelect(_this.props.item); }}, React.createElement(SmartInput, {"className": "quantity", "model": item, "modelProp": "quantity", "isNumber": true}), React.createElement("span", {"className": "name"}, item.name), React.createElement("span", {"className": "price"}, Utils.formatCurrency(Utils.ticketItemTotals(item).total)), this.props.item.note && this.props.item.note !== '' ?
                React.createElement(SmartInput, {"className": "note", "model": item, "modelProp": "note", "isMultiline": true})
                : null));
        };
        return TicketItem;
    })(Base.SyncView);
    exports.TicketItem = TicketItem;
    var TicketItemEdit = (function (_super) {
        __extends(TicketItemEdit, _super);
        function TicketItemEdit(props) {
            _super.call(this, props);
            this.name = '          TicketItemEdit';
            this.state = this.getState(props.item);
        }
        TicketItemEdit.prototype.componentWillReceiveProps = function (props) {
            if (props.item !== this.props.item) {
                this.setState(this.getState(props.item));
            }
        };
        TicketItemEdit.prototype.getState = function (item) {
            return {
                mutable: JSON.parse(JSON.stringify(item)),
                isNew: false,
                isDirty: false
            };
        };
        TicketItemEdit.prototype.save = function () {
            this.props.onSave(this.state.mutable);
        };
        TicketItemEdit.prototype.cancel = function () {
            this.props.onCancel();
        };
        TicketItemEdit.prototype.remove = function () {
            this.props.onRemove(this.props.item.key);
        };
        TicketItemEdit.prototype.render = function () {
            var _this = this;
            var classNames = this.preRender(['ticket-item-details']);
            var item = this.props.item;
            return (React.createElement("div", {"className": classNames.join(' ')}, React.createElement("div", {"className": "input-field"}, React.createElement("span", {"className": "label"}, "Quantity"), React.createElement("input", {"value": this.state.mutable.quantity, "onChange": this.handleChange.bind(this, 'mutable', 'quantity')})), React.createElement("div", {"className": "input-field"}, React.createElement("span", {"className": "label"}, "Name"), React.createElement("input", {"value": this.state.mutable.name, "onChange": this.handleChange.bind(this, 'mutable', 'name')})), React.createElement("div", {"className": "input-field"}, React.createElement("span", {"className": "label"}, "Price"), React.createElement("input", {"value": this.state.mutable.price, "onChange": this.handleChange.bind(this, 'mutable', 'price')})), React.createElement("div", {"className": "input-field"}, React.createElement("span", {"className": "label"}, "Note"), React.createElement("textarea", {"value": this.state.mutable.note, "rows": 8, "onChange": this.handleChange.bind(this, 'mutable', 'note')})), React.createElement(Base.SimpleConfirmView, {"onCancel": function () { _this.cancel(); }, "onSave": function () { _this.save(); }, "onRemove": this.state.isNew ? null : this.remove.bind(this), "isDirty": this.state.isDirty})));
        };
        return TicketItemEdit;
    })(Base.SyncView);
    exports.TicketItemEdit = TicketItemEdit;
});
//# sourceMappingURL=Reconciliation.js.map