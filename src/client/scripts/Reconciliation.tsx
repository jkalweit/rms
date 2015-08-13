/// <reference path="./typings/tsd.d.ts" />


import React = require('react/addons');
import Models = require('./Models');
import Base = require('./BaseViews');



export interface ReconciliationViewProps {
    reconciliation: Models.Reconciliation;
}
export interface ReconciliationViewState {
    selectedTicket: Models.Ticket;
}
export class ReconciliationView extends Base.SyncView<ReconciliationViewProps, ReconciliationViewState> {
    name: string = 'ReconciliationView';
    constructor(props: ReconciliationViewProps) {
        super(props);
        this.state = {
            selectedTicket: null
        };
    }
    handleSelectTicket(ticket: Models.Ticket) {
        //console.log('Select ticket: ' + JSON.stringify(ticket));
        this.setState({ selectedTicket: ticket });
    }
    doTest() {
        console.log('Doing test...');

    }
    render() {
        console.log('   Render: Reconciliation');
        return (
            <div className="reconciliation">
            {
            <TicketsView tickets={this.props.reconciliation.tickets}
            onSelectTicket={ this.handleSelectTicket.bind(this) }
            selectedTicket={ this.state.selectedTicket }></TicketsView>
            /*
            { this.state.selectedTicket ? (<TicketDetailsView ticket={this.state.selectedTicket}></TicketDetailsView>) : null }
            <menu.MenuView menu={this.props.menu}></menu.MenuView>
            */ }
            </div>
        );
    }
}






export interface TicketsViewProps {
    tickets: {[key: string]: Models.Ticket};
    selectedTicket: Models.Ticket;
    onSelectTicket: (ticket: Models.Ticket) => void;
}
export interface TicketsViewState {
    filteredTickets?: { [key: string]: Models.Ticket };
}
export class TicketsView extends Base.SyncView<TicketsViewProps, TicketsViewState> {
    name: string = '  TicketsView';
    filterInput: any;
    constructor(props: TicketsViewProps) {
        super(props);
        this.state = {
            filteredTickets: this.getFilteredTickets('', this.props.tickets)
        };
    }
    componentWillReceiveProps(nextProps: TicketsViewProps) {
      //console.log('TicketsView receive new props:', nextProps);
      if(nextProps.tickets !== this.props.tickets) {
        this.updateFilteredTickets(nextProps.tickets, this.filterInput.value);
      }
    }
    handleFilterChanged(element: any, e: any) {
        var tickets = this.props.tickets;
        if (e.keyCode === 13) {
            var ticket: Models.Ticket = {
                key: new Date().toISOString(),
                name: e.target.value
            };
            e.target.value = '';
            (this.props.tickets as any).__.set(ticket.key, ticket);
            // Store.insertTicket(ticket, (immutable: models.TicketModel) => {
            //     this.props.onSelectTicket(immutable);
            //     this.updateFilteredTickets(this.props.tickets, e.target.value);
            //   });
        } else {
          this.updateFilteredTickets(this.props.tickets, e.target.value);
        }
    }
    updateFilteredTickets(tickets: {[key: string]: Models.Ticket}, filter: string) {
      var filteredTickets = this.getFilteredTickets(filter, tickets);
      this.setState({ filteredTickets: filteredTickets });
    }
    getFilteredTickets(filter: string, tickets: {[key: string]: Models.Ticket}) {
        var normalized = filter.trim().toLowerCase();
        if (normalized.length === 0) return tickets;

        var filtered: { [key: string]: Models.Ticket } = {};

        Object.keys(tickets).forEach((key) => {
            if (key !== 'lastModified' && tickets[key].name.toLowerCase().indexOf(normalized) >= 0) {
                filtered[key] = tickets[key];
            }
        });
        return filtered;
    }
    render() {
        var tickets = this.state.filteredTickets;
        var nodes = Object.keys(tickets).map((key) => {
            if(key !== 'lastModified') {
            var ticket = tickets[key];
            var isSelected = this.props.selectedTicket === ticket;
            return (<TicketView key={key} isSelected={isSelected} ticket={ticket} onSelect={(ticket) => { this.props.onSelectTicket(ticket) } }></TicketView>);
          }
        });
        return (
            <div className="ticket-list">
              <h3>Tickets</h3>
              <input className="name-filter" ref={(el) => {
                  var input = (React.findDOMNode(el) as any);
                  if (input) {
                      this.filterInput = input;
                      input.focus();
                      input['onkeyup'] = (e: any) => {
                          this.handleFilterChanged(input, e);
                      }
                  }
              } } />
              <ul>
              { nodes }
              </ul>
            </div>);
    }
}




export interface TicketViewProps {
    key: string;
    isSelected: boolean;
    ticket: Models.Ticket;
    onSelect: (ticket: Models.Ticket) => void;
}
export class TicketView extends Base.SyncView<TicketViewProps, {}> {
    name: string = '    TicketView';
    render() {
        var ticket = this.props.ticket;
        console.log('       Render: Ticket: ' + ticket.name);
        return (
            <li className={ this.props.isSelected ? 'active' : '' } onClick={() => { this.props.onSelect(ticket) } }>{ticket.name}</li>
        );
    }
}
