/// <reference path="./typings/tsd.d.ts" />


import React = require('react/addons');
import Models = require('./Models');
import Base = require('./BaseViews');
import Menu = require('./Menu');
import Sync = require('./SyncNode');
import Utils = require('./Utils');

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
    componentWillReceiveProps(nextProps: ReconciliationViewProps) {
        if (nextProps.reconciliation.tickets !== this.props.reconciliation.tickets) {
            if (this.state.selectedTicket) {
                this.setState({ selectedTicket: nextProps.reconciliation.tickets[this.state.selectedTicket.key] });
            }
        }
    }
    handleSelectTicket(ticket: Models.Ticket) {
        //console.log('Select ticket: ' + JSON.stringify(ticket));
        this.setState({ selectedTicket: ticket });
    }
    handleSelectMenuItem(item: Models.MenuItem) {
        var ticket = this.state.selectedTicket;
        if (ticket) {
            var ticketItem = {
                key: new Date().toISOString(),
                name: item.name,
                price: item.price,
                quantity: 1
            } as Models.TicketItem;
            (ticket.items as any as Sync.SyncNode).set(ticketItem.key, ticketItem);
        }
    }
    render() {
        //console.log(this.name, 'Render');
        var classNames = this.preRender(['reconciliation']);
        return (
            <div className={classNames.join(' ') }>
            <Tickets tickets={this.props.reconciliation.tickets}
            onSelectTicket={ this.handleSelectTicket.bind(this) }
            selectedTicket={ this.state.selectedTicket }></Tickets>
            { this.state.selectedTicket ? (<TicketDetails ticket={this.state.selectedTicket} onRemove={ (ticket: Models.Ticket) => { (this.props.reconciliation.tickets as any).remove(ticket.key); this.setState({ selectedTicket: null }); } }></TicketDetails>) : null }
            <Menu.Menu menu={this.props.reconciliation.menu} onItemSelected={ this.handleSelectMenuItem.bind(this) }></Menu.Menu>
            </div>
        );
    }
}






export interface TicketsProps {
    tickets: { [key: string]: Models.Ticket };
    selectedTicket: Models.Ticket;
    onSelectTicket: (ticket: Models.Ticket) => void;
}
export interface TicketsState {
    showPaidTickets?: boolean;
    filteredTickets?: Models.Ticket[];
    filter?: string;
}
export class Tickets extends Base.SyncView<TicketsProps, TicketsState> {
    name: string = '  Tickets';
    filterInput: any;
    constructor(props: TicketsProps) {
        super(props);

        this.state = {
            showPaidTickets: false,
            filteredTickets: this.getFilteredTickets('', this.props.tickets),
            filter: ''
        };
    }
    componentWillReceiveProps(nextProps: TicketsProps, nextState: any) {
        //console.log('TicketsView receive new props:', nextProps, nextState);
        if (nextProps.tickets !== this.props.tickets) {
            this.updateFilteredTickets(nextProps.tickets, this.filterInput.value);
        }
    }
    handleFilterChanged(element: any, e: any) {
        var tickets = this.props.tickets;
        if (e.keyCode === 13) {
            var ticket: Models.Ticket = {
                key: new Date().toISOString(),
                name: e.target.value,
                items: {}
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
            this.updateFilteredTickets(tickets, e.target.value);
        }
    }
    updateFilteredTickets(tickets: { [key: string]: Models.Ticket }, filter: string) {
        var filteredTickets = this.getFilteredTickets(filter, tickets);
        this.setState({ filteredTickets: filteredTickets });
    }
    getFilteredTickets(filter: string, tickets: { [key: string]: Models.Ticket }): Models.Ticket[] {
        //console.log('get filtered tickets: ', tickets);
        var normalized = filter.trim().toLowerCase();

        var ticketsArray = Utils.toArray(tickets);
        //console.log('ticketsArray: ', ticketsArray);
        var filtered: Models.Ticket[] = ticketsArray.filter((ticket: Models.Ticket) => {
            //console.log('ticket:', ticket);
            if (normalized.length === 0 || ticket.name.toLowerCase().indexOf(normalized) >= 0) {
                //console.log(!ticket.isPaid, this.state.showPaidTickets);
                return !ticket.isPaid || this.state.showPaidTickets;
            }
            return false;
        });
        //console.log('filtered: ', filtered);
        return filtered;
    }
    toggleShowPaid() {
        this.setState({ showPaidTickets: !this.state.showPaidTickets }, () => {
            this.updateFilteredTickets(this.props.tickets, this.filterInput.value);
        });
    }
    render() {
        //console.log(this.name, 'render');
        //console.log('filteredTickets: ', this.state.filteredTickets);
        var classNames = this.preRender(['ticket-list']);
        var nodes = this.state.filteredTickets.map((ticket: Models.Ticket) => {
            var isSelected = this.props.selectedTicket === ticket;
            return (<Ticket key={ticket.key} isSelected={isSelected} ticket={ticket} onSelect={(ticket) => { this.props.onSelectTicket(ticket) } }></Ticket>);
        });
        return (
            <div className={classNames.join(' ') }>
              <div className="btn" onClick={() => { this.toggleShowPaid(); } }>Paid: { this.state.showPaidTickets ? 'Shown' : 'Hidden' }</div>
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
        if (this.props.isSelected) classNames.push('active');
        var ticket = this.props.ticket;
        //console.log('       Render: Ticket: ' + ticket.name);
        return (
            <li className={ classNames.join(' ') } onClick={() => { this.props.onSelect(ticket) } }>{ticket.name}</li>
        );
    }
}



export interface TicketDetailsProps {
    ticket: Models.Ticket;
    onRemove: (ticket: Models.Ticket) => void;
}
export interface TicketDetailsState {
    selectedItem: Models.TicketItem
}
export class TicketDetails extends Base.SyncView<TicketDetailsProps, TicketDetailsState> {
    name: string = '        TicketDetails';
    constructor(props: TicketDetailsProps) {
        super(props);
        this.state = {
            selectedItem: null
        }
    }
    render() {
        var classNames = this.preRender(['ticket-details']);
        var ticket = this.props.ticket;
        //console.log(this.name, ticket.name);

        var items = Utils.toArray(ticket.items);
        var nodes = items.map((item: Models.TicketItem) => {
            return (
                <TicketItem key={item.key} item={item} onSelect={(item: Models.TicketItem) => { this.setState({ selectedItem: item }); (this.refs['ticketItemEditModal'] as Base.ModalView).show() }}></TicketItem>
            );
        });


        var totals = Utils.ticketTotals(this.props.ticket);

        return (
            <div className={classNames.join(' ') }>
              <h3>{ticket.name} <button onClick={() => { if (confirm('Remove?')) this.props.onRemove(this.props.ticket); } }>X</button></h3>
              <ul>
                { nodes }
              </ul>
              <div className="ticket-footer">
                <button onClick={() => { (ticket as Sync.ISyncNode).set('isPaid', !ticket.isPaid); } }>{ ticket.isPaid ? 'Paid' : 'Open' }</button>
                <div className="total">
                Total: { Utils.formatCurrency(totals.total) }
                </div>
              </div>


              <Base.ModalView ref="ticketItemEditModal">

                {
                this.state.selectedItem ? (
                    <TicketItemEdit
                    item={this.state.selectedItem}
                    onSave={(item: Models.TicketItem) => {
                      (this.props.ticket.items as Sync.ISyncNode).set(item.key, item);
                      (this.refs['ticketItemEditModal'] as Base.ModalView).hide();
                    }}
                    ></TicketItemEdit>
                ) : null

                }
              </Base.ModalView>


            </div>
        );
    }
}


export interface TicketItemProps {
    key: string;
    item: Models.TicketItem;
    onSelect: (item: Models.TicketItem) => void;
}
export class TicketItem extends Base.SyncView<TicketItemProps, {}> {
    name: string = '          TicketItem';
    render() {
        var classNames = this.preRender();
        var item = this.props.item;
        return (
            <li className={classNames.join(' ')} onClick={() => { this.props.onSelect(this.props.item); }}>
              <span className="quantity">{item.quantity}</span>
              <span className="name">{item.name}</span>
              <span className="price">{ Utils.formatCurrency(Utils.ticketItemTotals(item).total) }</span>
              <span className="note">{item.note}</span>
            </li>
        );
    }
}

export interface TicketItemEditProps {
    item: Models.TicketItem;
    //onRemove: (item: Models.TicketItem) => void;
    onSave: (item: Models.TicketItem) => void;
}
export interface TicketItemEditState extends Base.SyncViewState {
    mutable: Models.TicketItem;
}
export class TicketItemEdit extends Base.SyncView<TicketItemEditProps, TicketItemEditState> {
    name: string = '          TicketItemEdit';
    constructor(props: TicketItemEditProps) {
        super(props);
        this.state = {
            mutable: JSON.parse(JSON.stringify(props.item)),
            isNew: false,
            isDirty: false
        };
    }
    save() {
      this.props.onSave(this.state.mutable);
    }
    cancel() {

    }
    remove() {

    }
    render() {
        var classNames = this.preRender(['ticket-item-details']);
        var item = this.props.item;
        return (
            <div className={classNames.join(' ') }>
              <input value={this.state.mutable.quantity as any} onChange={ this.handleChange.bind(this, 'mutable', 'quantity') } />
              <input value={this.state.mutable.name} onChange={ this.handleChange.bind(this, 'mutable', 'name') } />
              <input value={this.state.mutable.price as any} onChange={ this.handleChange.bind(this, 'mutable', 'price') } />
              <input value={this.state.mutable.note} onChange={ this.handleChange.bind(this, 'mutable', 'note') } />
              <Base.SimpleConfirmView
              onCancel={() => { this.cancel() } }
              onSave={() => { this.save() } }
              onRemove={ this.state.isNew ? null : this.remove.bind(this) }
              isDirty={this.state.isDirty}
              ></Base.SimpleConfirmView>
            </div>
        );
    }
}
