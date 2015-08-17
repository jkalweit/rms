/// <reference path="./typings/tsd.d.ts" />


import React = require('react/addons');
import Models = require('./Models');
import Base = require('./BaseViews');
import Menu = require('./Menu');


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
    render() {
        console.log(this.name, 'Render');
        return (
            <div className="reconciliation">
            <Tickets tickets={this.props.reconciliation.tickets}
            onSelectTicket={ this.handleSelectTicket.bind(this) }
            selectedTicket={ this.state.selectedTicket }></Tickets>
            { this.state.selectedTicket ? (<TicketDetailsView ticket={this.state.selectedTicket} onRemove={ (ticket: Models.Ticket) => { (this.props.reconciliation.tickets as any).remove(ticket.key); this.setState( { selectedTicket: null }); }}></TicketDetailsView>) : null }
            <Menu.Menu menu={this.props.reconciliation.menu}></Menu.Menu>
            </div>
        );
    }
}






export interface TicketsProps {
    tickets: {[key: string]: Models.Ticket};
    selectedTicket: Models.Ticket;
    onSelectTicket: (ticket: Models.Ticket) => void;
}
export interface TicketsState {
    filteredTickets?: { [key: string]: Models.Ticket };
}
export class Tickets extends Base.SyncView<TicketsProps, TicketsState> {
    name: string = '  Tickets';
    filterInput: any;
    constructor(props: TicketsProps) {
        super(props);
        this.state = {
            filteredTickets: this.getFilteredTickets('', this.props.tickets)
        };
    }
    componentWillReceiveProps(nextProps: TicketsProps) {
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
            var result = (this.props.tickets as any).set(ticket.key, ticket);
            var newTickets = result.parentImmutable;
            this.props.onSelectTicket(result.value);
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
        //console.log('get filtered tickets: ', tickets);
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
        console.log(this.name, 'render');
        var tickets = this.state.filteredTickets;
        //console.log('tickets: ', tickets);
        var nodes = Object.keys(tickets).map((key) => {
            if(key !== 'lastModified') {
            var ticket = tickets[key];
            var isSelected = this.props.selectedTicket === ticket;
            return (<Ticket key={key} isSelected={isSelected} ticket={ticket} onSelect={(ticket) => { this.props.onSelectTicket(ticket) } }></Ticket>);
          }
        });
        return (
            <div className="ticket-list">
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




export interface TicketProps {
    key: string;
    isSelected: boolean;
    ticket: Models.Ticket;
    onSelect: (ticket: Models.Ticket) => void;
}
export class Ticket extends Base.SyncView<TicketProps, {}> {
    name: string = '    TicketView';
    render() {
        var classNames = this.preRender();
        if(this.props.isSelected) classNames.push('active');
        var ticket = this.props.ticket;
        console.log('       Render: Ticket: ' + ticket.name);
        return (
            <li className={ classNames.join(' ') } onClick={() => { this.props.onSelect(ticket) } }>{ticket.name}</li>
        );
    }
}



export interface TicketDetailsViewProps {
    ticket: Models.Ticket;
    onRemove: (ticket: Models.Ticket) => void;
}
export class TicketDetailsView extends Base.SyncView<TicketDetailsViewProps, {}> {
    name: string = '        TicketDetailsView';
    render() {
        var ticket = this.props.ticket;
        console.log(this.name, ticket.name);
        return (
            <div className="ticket-details">
              <h3>{ticket.name}</h3>
              <button onClick={() => { this.props.onRemove(this.props.ticket); } }>Delete</button>
            </div>
        );
    }
}
