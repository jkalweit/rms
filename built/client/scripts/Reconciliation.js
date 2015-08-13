/// <reference path="./typings/tsd.d.ts" />
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", 'react/addons', './BaseViews'], function (require, exports, React, Base) {
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
            this.setState({ selectedTicket: ticket });
        };
        ReconciliationView.prototype.doTest = function () {
            console.log('Doing test...');
        };
        ReconciliationView.prototype.render = function () {
            console.log('   Render: Reconciliation');
            return (React.createElement("div", {"className": "reconciliation"}, React.createElement(TicketsView, {"tickets": this.props.reconciliation.tickets, "onSelectTicket": this.handleSelectTicket.bind(this), "selectedTicket": this.state.selectedTicket})));
        };
        return ReconciliationView;
    })(Base.SyncView);
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
            if (nextProps.tickets !== this.props.tickets) {
                this.updateFilteredTickets(nextProps.tickets, this.filterInput.value);
            }
        };
        TicketsView.prototype.handleFilterChanged = function (element, e) {
            var tickets = this.props.tickets;
            if (e.keyCode === 13) {
                var ticket = {
                    key: new Date().toISOString(),
                    name: e.target.value
                };
                e.target.value = '';
                this.props.tickets.__.set(ticket.key, ticket);
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
                if (key !== 'lastModified' && tickets[key].name.toLowerCase().indexOf(normalized) >= 0) {
                    filtered[key] = tickets[key];
                }
            });
            return filtered;
        };
        TicketsView.prototype.render = function () {
            var _this = this;
            var tickets = this.state.filteredTickets;
            var nodes = Object.keys(tickets).map(function (key) {
                if (key !== 'lastModified') {
                    var ticket = tickets[key];
                    var isSelected = _this.props.selectedTicket === ticket;
                    return (React.createElement(TicketView, {"key": key, "isSelected": isSelected, "ticket": ticket, "onSelect": function (ticket) { _this.props.onSelectTicket(ticket); }}));
                }
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
    })(Base.SyncView);
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
    })(Base.SyncView);
    exports.TicketView = TicketView;
});
//# sourceMappingURL=Reconciliation.js.map