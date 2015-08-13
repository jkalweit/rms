/// <reference path="../typings/tsd.d.ts" />
/// <reference path="./Models.ts" />
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", 'react/addons', './Store', './MenuViews', './BaseViews'], function (require, exports, React, Store, menu, bv) {
    var ReconciliationView = (function (_super) {
        __extends(ReconciliationView, _super);
        function ReconciliationView(props) {
            _super.call(this, props);
            this.name = 'ReconciliationView';
            this.state = {
                selectedTicket: null
            };
        }
        ReconciliationView.prototype.handleSelectTicket = function (ticket) {
            console.log('Select ticket: ' + JSON.stringify(ticket));
            this.setState({ selectedTicket: ticket });
        };
        ReconciliationView.prototype.render = function () {
            console.log('   Render: Reconciliation');
            return (React.createElement("div", {"className": "reconciliation"}, React.createElement(TicketsView, {"tickets": this.props.tickets, "onSelectTicket": this.handleSelectTicket.bind(this), "selectedTicket": this.state.selectedTicket}), this.state.selectedTicket ? (React.createElement(TicketDetailsView, {"ticket": this.state.selectedTicket})) : null, React.createElement(menu.MenuView, {"menu": this.props.menu})));
        };
        return ReconciliationView;
    })(bv.FreezerView);
    exports.ReconciliationView = ReconciliationView;
    var TicketsView = (function (_super) {
        __extends(TicketsView, _super);
        function TicketsView(props) {
            _super.call(this, props);
            this.name = '  TicketsView';
            this.state = {
                filteredTickets: this.getFilteredTickets('', this.props.tickets)
            };
        }
        TicketsView.prototype.componentWillReceiveProps = function (nextProps) {
            console.log('TicketsView receive new props:', nextProps);
            if (nextProps.tickets !== this.props.tickets) {
                this.updateFilteredTickets(nextProps.tickets, this.filterInput.value);
            }
        };
        TicketsView.prototype.handleFilterChanged = function (element, e) {
            var _this = this;
            var tickets = this.props.tickets;
            if (e.keyCode === 13) {
                var ticket = {
                    key: new Date().toISOString(),
                    name: e.target.value
                };
                e.target.value = '';
                Store.insertTicket(ticket, function (immutable) {
                    _this.props.onSelectTicket(immutable);
                    _this.updateFilteredTickets(_this.props.tickets, e.target.value);
                });
            }
            else {
                this.updateFilteredTickets(this.props.tickets, e.target.value);
            }
        };
        TicketsView.prototype.updateFilteredTickets = function (tickets, filter) {
            var filteredTickets = this.getFilteredTickets(filter, tickets);
            this.setState({ filteredTickets: filteredTickets });
        };
        TicketsView.prototype.getFilteredTickets = function (filter, tickets) {
            var normalized = filter.trim().toLowerCase();
            if (normalized.length === 0)
                return tickets;
            var filtered = {};
            Object.keys(tickets).forEach(function (key) {
                if (tickets[key].name.toLowerCase().indexOf(normalized) >= 0) {
                    filtered[key] = tickets[key];
                }
            });
            return filtered;
        };
        TicketsView.prototype.render = function () {
            var _this = this;
            var tickets = this.state.filteredTickets;
            var nodes = Object.keys(tickets).map(function (key) {
                var ticket = tickets[key];
                var isSelected = _this.props.selectedTicket === ticket;
                return (React.createElement(TicketView, {"key": key, "isSelected": isSelected, "ticket": ticket, "onSelect": function (ticket) { _this.props.onSelectTicket(ticket); }}));
            });
            return (React.createElement("div", {"className": "ticket-list"}, React.createElement("h3", null, "Tickets"), React.createElement("input", {"className": "name-filter", "ref": function (el) {
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
        return TicketsView;
    })(bv.FreezerView);
    exports.TicketsView = TicketsView;
    var TicketView = (function (_super) {
        __extends(TicketView, _super);
        function TicketView() {
            _super.apply(this, arguments);
            this.name = '    TicketView';
        }
        TicketView.prototype.render = function () {
            var _this = this;
            var ticket = this.props.ticket;
            console.log('       Render: Ticket: ' + ticket.name);
            return (React.createElement("li", {"className": this.props.isSelected ? 'active' : '', "onClick": function () { _this.props.onSelect(ticket); }}, ticket.name));
        };
        return TicketView;
    })(bv.FreezerView);
    exports.TicketView = TicketView;
    var TicketDetailsView = (function (_super) {
        __extends(TicketDetailsView, _super);
        function TicketDetailsView() {
            _super.apply(this, arguments);
            this.name = '        TicketDetailsView';
        }
        TicketDetailsView.prototype.render = function () {
            var ticket = this.props.ticket;
            console.log('         Render: TicketDetails: ' + ticket.name);
            return (React.createElement("div", {"className": "ticket-details"}, React.createElement("h3", null, ticket.name)));
        };
        return TicketDetailsView;
    })(bv.FreezerView);
    exports.TicketDetailsView = TicketDetailsView;
});
//# sourceMappingURL=ReconciliationViews.js.map