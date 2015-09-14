/// <reference path="./typings/tsd.d.ts" />


import React = require('react/addons');
import Models = require('./Models');
import Base = require('./BaseViews');
import Menu = require('./Menu');
import Sync = require('./SyncNode');
import Utils = require('./Utils');
import SmartInputRef = require('./SmartInput');

var SmartInput = SmartInputRef.SmartInput;

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
                type: item.type,
                price: item.price,
                tax: item.tax,
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
            return (<Ticket key={ticket.key} isSelected={isSelected} ticket={ticket}
              onSelect={(ticket) => { this.props.onSelectTicket(ticket) } }></Ticket>);
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
    allowDrop(ev: React.DragEvent) {
      if(Utils.arrayContains((ev.dataTransfer.types as any), 'application/ticketitem')) {
        ev.preventDefault();
      }
    }
    drop(ev: React.DragEvent) {
      ev.preventDefault();
      var dragData = JSON.parse(ev.dataTransfer.getData('application/ticketitem')) as TicketItemDragData;
      var destinationTicket = this.props.ticket;
      var tickets = (destinationTicket as Sync.ISyncNode).parent as {[key: string]: Models.Ticket};
      var sourceTicket = tickets[dragData.sourceTicketKey];
      var sourceItem = sourceTicket.items[dragData.sourceItemKey];
      (destinationTicket.items as Sync.ISyncNode).set(sourceItem.key, sourceItem);
      (sourceTicket.items as Sync.ISyncNode).remove(sourceItem.key);
    }
    render() {
        var classNames = this.preRender();
        if (this.props.isSelected) classNames.push('active');
        var ticket = this.props.ticket;
        //console.log('       Render: Ticket: ' + ticket.name);
        return (
            <li className={ classNames.join(' ') } onClick={() => { this.props.onSelect(ticket) } }
            onDragOver={this.allowDrop.bind(this)} onDrop={this.drop.bind(this)}>{ticket.name}</li>
        );
    }
}


export interface TicketItemDragData {
  sourceTicketKey: string;
  sourceItemKey: string;
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
    drag(ev: React.DragEvent, item: Models.TicketItem) {
      var dragObj: TicketItemDragData = {
        sourceTicketKey: this.props.ticket.key,
        sourceItemKey: item.key
      };
      ev.dataTransfer.setData('application/ticketitem', JSON.stringify(dragObj)); // type gets converted to lowercase, at least in Chrome... -JDK 2015-09-13
      ev.dataTransfer.setData('text/plain', item.name);
    }
    render() {
        var classNames = this.preRender(['ticket-details']);
        var ticket = this.props.ticket;
        //console.log(this.name, ticket.name);

        var items = Utils.toArray(ticket.items);
        var nodes = items.map((item: Models.TicketItem) => {
            return (
                <TicketItem key={item.key} item={item} onDragItem={this.drag.bind(this)} onSelect={(item: Models.TicketItem) => { this.setState({ selectedItem: item }); (this.refs['ticketItemEditModal'] as Base.ModalView).show() }}></TicketItem>
            );
        });


        var totals = Utils.ticketTotals(this.props.ticket);

        return (
            <div className={classNames.join(' ') }>
              <div className="ticket-header">
                <SmartInput model={this.props.ticket} modelProp="name" /><button onClick={() => { if (confirm('Remove?')) this.props.onRemove(this.props.ticket); } }>X</button>
              </div>
              <div className="ticket-items">
                <ul>
                  { nodes }
                </ul>
              </div>
              <div className="ticket-footer">
                <button onClick={() => { (ticket as Sync.ISyncNode).set('isPaid', !ticket.isPaid); } }>{ ticket.isPaid ? 'Paid' : 'Open' }</button>
                <div className="totals">
                  <div className="food">
                    Food: <span className="amount">{ Utils.formatCurrency(totals.Food) }</span>
                  </div>
                  <div className="tax">
                  Tax: <span className="amount">{ Utils.formatCurrency(totals.tax) }</span>
                  </div>
                  <div className="bar">
                  Bar: <span className="amount">{ Utils.formatCurrency(totals.Alcohol) }</span>
                  </div>
                  <div className="total">
                  Total: <span className="amount">{ Utils.formatCurrency(totals.total) }</span>
                  </div>
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
                    onCancel={() => {
                      (this.refs['ticketItemEditModal'] as Base.ModalView).hide();
                    }}
                    onRemove={(key: string) => {
                      (this.props.ticket.items as Sync.ISyncNode).remove(key);
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
    onDragItem: (ev: React.DragEvent, item: Models.TicketItem) => void;
    onSelect: (item: Models.TicketItem) => void;
}
export class TicketItem extends Base.SyncView<TicketItemProps, {}> {
    name: string = '          TicketItem';
    render() {
        var classNames = this.preRender();
        var item = this.props.item;
        return (
            <li className={classNames.join(' ')} onClick={() => { this.props.onSelect(this.props.item); }}
              draggable onDragStart={(ev: React.DragEvent) => { this.props.onDragItem(ev, this.props.item); }}>
              <SmartInput className="quantity" model={item} modelProp="quantity" isNumber />
              <span className="name">{item.name}</span>
              <span className="price">{ Utils.formatCurrency(Utils.ticketItemTotals(item).subTotal) }</span>
              { this.props.item.note && this.props.item.note !== '' ?
                  <SmartInput className="note" model={item} modelProp="note" isMultiline />
                  : null
              }
            </li>
        );
    }
}

export interface TicketItemEditProps {
    item: Models.TicketItem;
    onRemove: (key: string) => void;
    onCancel: () => void;
    onSave: (item: Models.TicketItem) => void;
}
export interface TicketItemEditState extends Base.SyncViewState {
    mutable: Models.TicketItem;
}
export class TicketItemEdit extends Base.SyncView<TicketItemEditProps, TicketItemEditState> {
    name: string = '          TicketItemEdit';
    constructor(props: TicketItemEditProps) {
        super(props);
        this.state = this.getState(props.item);
    }
    componentWillReceiveProps(props: TicketItemEditProps) {
        if(props.item !== this.props.item) {
            this.setState(this.getState(props.item));
        }
    }
    getState(item: Models.TicketItem): TicketItemEditState {
      return {
          mutable: JSON.parse(JSON.stringify(item)),
          isNew: false,
          isDirty: false
      };
    }
    save() {
      this.props.onSave(this.state.mutable);
    }
    cancel() {
      this.props.onCancel();
    }
    remove() {
      this.props.onRemove(this.props.item.key);
    }
    render() {
        var classNames = this.preRender(['ticket-item-details']);
        var item = this.props.item;
        return (
            <div className={classNames.join(' ') }>
              <div className="input-field">
                <span className="label">Quantity</span>
                <input value={this.state.mutable.quantity as any} onChange={ this.handleChange.bind(this, 'mutable', 'quantity') } />
              </div>
              <div className="input-field">
                <span className="label">Name</span>
                <input value={this.state.mutable.name} onChange={ this.handleChange.bind(this, 'mutable', 'name') } />
              </div>
              <div className="input-field">
                <span className="label">Price</span>
                <input value={this.state.mutable.price as any} onChange={ this.handleChange.bind(this, 'mutable', 'price') } />
              </div>
              <div className="input-field">
                <span className="label">Note</span>
                <textarea value={this.state.mutable.note} rows={8} onChange={ this.handleChange.bind(this, 'mutable', 'note') } />
              </div>
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
