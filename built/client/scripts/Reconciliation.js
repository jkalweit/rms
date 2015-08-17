/// <reference path="./typings/tsd.d.ts" />
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", 'react/addons', './BaseViews', './Menu'], function (require, exports, React, Base, Menu) {
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
        ReconciliationView.prototype.render = function () {
            var _this = this;
            console.log(this.name, 'Render');
            return (React.createElement("div", {"className": "reconciliation"}, React.createElement(Tickets, {"tickets": this.props.reconciliation.tickets, "onSelectTicket": this.handleSelectTicket.bind(this), "selectedTicket": this.state.selectedTicket}), this.state.selectedTicket ? (React.createElement(TicketDetailsView, {"ticket": this.state.selectedTicket, "onRemove": function (ticket) { _this.props.reconciliation.tickets.remove(ticket.key); _this.setState({ selectedTicket: null }); }})) : null, React.createElement(Menu.Menu, {"menu": this.props.reconciliation.menu})));
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
                filteredTickets: this.getFilteredTickets('', this.props.tickets)
            };
        }
        Tickets.prototype.componentWillReceiveProps = function (nextProps) {
            if (nextProps.tickets !== this.props.tickets) {
                this.updateFilteredTickets(nextProps.tickets, this.filterInput.value);
            }
        };
        Tickets.prototype.handleFilterChanged = function (element, e) {
            var tickets = this.props.tickets;
            if (e.keyCode === 13) {
                var ticket = {
                    key: new Date().toISOString(),
                    name: e.target.value
                };
                e.target.value = '';
                var result = this.props.tickets.set(ticket.key, ticket);
                var newTickets = result.parentImmutable;
                this.props.onSelectTicket(result.value);
            }
            else {
                this.updateFilteredTickets(this.props.tickets, e.target.value);
            }
        };
        Tickets.prototype.updateFilteredTickets = function (tickets, filter) {
            var filteredTickets = this.getFilteredTickets(filter, tickets);
            this.setState({ filteredTickets: filteredTickets });
        };
        Tickets.prototype.getFilteredTickets = function (filter, tickets) {
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
        Tickets.prototype.render = function () {
            var _this = this;
            console.log(this.name, 'render');
            var tickets = this.state.filteredTickets;
            var nodes = Object.keys(tickets).map(function (key) {
                if (key !== 'lastModified') {
                    var ticket = tickets[key];
                    var isSelected = _this.props.selectedTicket === ticket;
                    return (React.createElement(Ticket, {"key": key, "isSelected": isSelected, "ticket": ticket, "onSelect": function (ticket) { _this.props.onSelectTicket(ticket); }}));
                }
            });
            return (React.createElement("div", {"className": "ticket-list"}, React.createElement("input", {"className": "name-filter", "ref": function (el) {
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
            console.log('       Render: Ticket: ' + ticket.name);
            return (React.createElement("li", {"className": classNames.join(' '), "onClick": function () { _this.props.onSelect(ticket); }}, ticket.name));
        };
        return Ticket;
    })(Base.SyncView);
    exports.Ticket = Ticket;
    var TicketDetailsView = (function (_super) {
        __extends(TicketDetailsView, _super);
        function TicketDetailsView() {
            _super.apply(this, arguments);
            this.name = '        TicketDetailsView';
        }
        TicketDetailsView.prototype.render = function () {
            var _this = this;
            var ticket = this.props.ticket;
            console.log(this.name, ticket.name);
            return (React.createElement("div", {"className": "ticket-details"}, React.createElement("h3", null, ticket.name), React.createElement("button", {"onClick": function () { _this.props.onRemove(_this.props.ticket); }}, "Delete")));
        };
        return TicketDetailsView;
    })(Base.SyncView);
    exports.TicketDetailsView = TicketDetailsView;
});
//# sourceMappingURL=Reconciliation.js.map