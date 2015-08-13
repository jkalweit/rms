/// <reference path="../typings/tsd.d.ts" />
/// <reference path="./Models.ts" />

import React = require('react/addons');
import moment = require('moment');

import models = require('./Models');
import Store = require('./Store');

import menu = require('./MenuViews');
import bv = require('./BaseViews');


export interface ReconciliationViewProps {
    tickets: models.FreezerHash<models.TicketModel>;
    menu: models.MenuModel;
}
export interface ReconciliationViewState {
    selectedTicket: models.TicketModel;
}
export class ReconciliationView extends bv.FreezerView<ReconciliationViewProps, ReconciliationViewState> {
    name: string = 'ReconciliationView';
    constructor(props) {
        super(props);
        this.state = {
            selectedTicket: null
        };
    }
    handleSelectTicket(ticket: models.TicketModel) {
        console.log('Select ticket: ' + JSON.stringify(ticket));
        this.setState({ selectedTicket: ticket });
    }
    render() {
        console.log('   Render: Reconciliation');
        return (
            <div className="reconciliation">
            <TicketsView tickets={this.props.tickets}
            onSelectTicket={ this.handleSelectTicket.bind(this) }
            selectedTicket={ this.state.selectedTicket }></TicketsView>
            { this.state.selectedTicket ? (<TicketDetailsView ticket={this.state.selectedTicket}></TicketDetailsView>) : null }
            <menu.MenuView menu={this.props.menu}></menu.MenuView>
            </div>
        );
    }
}



export interface TicketsViewProps {
    tickets: models.FreezerHash<models.TicketModel>;
    selectedTicket: models.TicketModel;
    onSelectTicket: (ticket: models.TicketModel) => void;
}
export interface TicketsViewState {
    filteredTickets?: { [key: string]: models.TicketModel } | models.FreezerHash<models.TicketModel>;
}
export class TicketsView extends bv.FreezerView<TicketsViewProps, TicketsViewState> {
    name: string = '  TicketsView';
    filterInput: any;
    constructor(props: TicketsViewProps) {
        super(props);
        this.state = {
            filteredTickets: this.getFilteredTickets('', this.props.tickets)
        };
    }
    componentWillReceiveProps(nextProps: TicketsViewProps) {
      console.log('TicketsView receive new props:', nextProps);
      if(nextProps.tickets !== this.props.tickets) {
        this.updateFilteredTickets(nextProps.tickets, this.filterInput.value);
      }
    }
    handleFilterChanged(element, e) {
        var tickets = this.props.tickets;
        if (e.keyCode === 13) {
            var ticket: models.TicketModel = {
                key: new Date().toISOString(),
                name: e.target.value
            };
            e.target.value = '';
            Store.insertTicket(ticket, (immutable: models.TicketModel) => {
                this.props.onSelectTicket(immutable);
                this.updateFilteredTickets(this.props.tickets, e.target.value);
              });
        } else {
          this.updateFilteredTickets(this.props.tickets, e.target.value);
        }
    }
    updateFilteredTickets(tickets: models.FreezerHash<models.TicketModel>, filter: string) {
      var filteredTickets = this.getFilteredTickets(filter, tickets);
      this.setState({ filteredTickets: filteredTickets });
    }
    getFilteredTickets(filter: string, tickets: models.FreezerHash<models.TicketModel>): {[key: string]: models.TicketModel} | models.FreezerHash<models.TicketModel> {
        var normalized = filter.trim().toLowerCase();
        if (normalized.length === 0) return tickets;

        var filtered: { [key: string]: models.TicketModel } = {};

        Object.keys(tickets).forEach((key) => {
            if (tickets[key].name.toLowerCase().indexOf(normalized) >= 0) {
                filtered[key] = tickets[key];
            }
        });
        return filtered;
    }
    render() {
        var tickets = this.state.filteredTickets;
        var nodes = Object.keys(tickets).map((key) => {
            var ticket = tickets[key];
            var isSelected = this.props.selectedTicket === ticket;
            return (<TicketView key={key} isSelected={isSelected} ticket={ticket} onSelect={(ticket) => { this.props.onSelectTicket(ticket) } }></TicketView>);
        });
        return (
            <div className="ticket-list">
              <h3>Tickets</h3>
              <input className="name-filter" ref={(el) => {
                  var input = (React.findDOMNode(el) as any);
                  if (input) {
                      this.filterInput = input;
                      input.focus();
                      input['onkeyup'] = (e) => {
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
    ticket: models.TicketModel;
    onSelect: (ticket: models.TicketModel) => void;
}
export class TicketView extends bv.FreezerView<TicketViewProps, any> {
    name: string = '    TicketView';
    render() {
        var ticket = this.props.ticket;
        console.log('       Render: Ticket: ' + ticket.name);
        return (
            <li className={ this.props.isSelected ? 'active' : '' } onClick={() => { this.props.onSelect(ticket) } }>{ticket.name}</li>
        );
    }
}





export interface TicketDetailsViewProps {
    ticket: models.TicketModel;
}
export class TicketDetailsView extends bv.FreezerView<TicketDetailsViewProps, {}> {
    name: string = '        TicketDetailsView';
    render() {
        var ticket = this.props.ticket;
        console.log('         Render: TicketDetails: ' + ticket.name);
        return (
            <div className="ticket-details">
              <h3>{ticket.name}</h3>
            </div>
        );
    }
}
