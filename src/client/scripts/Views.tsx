/// <reference path="./typings/tsd.d.ts" />


import React = require('react/addons');
//import Hammer = require('hammerjs');
import Sync = require('./SyncNodeSocket');
import Models = require('./Models');
import Nav = require('./Navigation');
import Rec = require('./Reconciliation');
import Menu = require('./Menu');
import Logger = require('./Logger');

'use strict';

//declare var Hammer: any;

export class Bootstrap {
    start() {
        //var hammertime = new Hammer(document.body);
        React.initializeTouchEvents(true);
        React.render(React.createElement(MainView, null), document.body);
    }
}




export interface MainViewState {
    reconciliation?: Models.Reconciliation;
    isNavOpen?: boolean;
    syncSocketStatus?: string;
}
export class MainView extends React.Component<{}, MainViewState> {
    constructor(props: {}) {
        super(props);

        var defaultRec: Models.Reconciliation;
        defaultRec = {
          name: 'Test Rec',
          tickets: { '0': { key: '0', name: 'Justin2' }},
          menu: { categories: { items: {} } }
        };

        var sync = new Sync.SyncNodeSocket<Models.Reconciliation>('/reconciliation', defaultRec);
        sync.onStatusChanged = (path: string, status: string) => {
          this.setState({ syncSocketStatus: status });
        };

        sync.onUpdated((updated: Models.Reconciliation) => {
            console.log('     setting state: ', updated);
            this.setState({ reconciliation: updated });
        });


        //console.log('sync.get: ', sync.get());

        this.state = {
            reconciliation: sync.get(),
            isNavOpen: false,
            syncSocketStatus: sync.status
        };
    }
    closeNav() {
        this.setState({ isNavOpen: false });
    }
    render() {
        //var rec = this.state.reconciliation;
        console.log('Render: MainView');
        var className = (this.state.isNavOpen ? 'open' : '');
        return (
            <div>
            <div className="sticky-header">
              <ul className={className}>
                <li className="hamburger-icon" onClick={() => { this.setState({ isNavOpen: !this.state.isNavOpen }) } }><span className="col-2 fa fa-bars"></span></li>
                <li><Nav.NavigationItem hash="#" onSelect={ () => { this.closeNav(); } }><span className="col-2">RMS</span></Nav.NavigationItem></li>
                <li className="hamburger"><Nav.NavigationItem hash="#reconciliation" onSelect={ () => { this.closeNav(); } }><span className="col-6">Reconciliation</span></Nav.NavigationItem></li>
                <li className="hamburger"><Nav.NavigationItem hash="#menu" onSelect={ () => { this.closeNav(); } }><span className="col-5">Menu</span></Nav.NavigationItem></li>
                <li className="hamburger"><Nav.NavigationItem hash="#kitchen" onSelect={ () => { this.closeNav(); } }><span className="col-5">Kitchen</span></Nav.NavigationItem></li>
              </ul>
            </div>
            <Nav.NavigationView hash="#">
              <h1>Welcome to RMS</h1>
              <p>There will be a dashboard here later.</p>
              <p>Use the navigation above to select a location.</p>
              <LogView ref="logView"></LogView>
            </Nav.NavigationView>
            <Nav.NavigationView hash="#reconciliation"><Rec.ReconciliationView reconciliation={this.state.reconciliation}></Rec.ReconciliationView></Nav.NavigationView>
            <Nav.NavigationView hash="#menu"><Menu.MenuEdit menu={this.state.reconciliation.menu}></Menu.MenuEdit></Nav.NavigationView>

            <Nav.NavigationView hash="#kitchen"><h1>The kitchen!</h1></Nav.NavigationView>
          */  }
          { /*
            <kitchenViews.KitchenOrdersView></kitchenViews.KitchenOrdersView>
             <inventoryViews.InventoryView></inventoryViews.InventoryView>
            <vendorViews.VendorsView></vendorViews.VendorsView>
        <shiftViews.ShiftsView></shiftViews.ShiftsView>
       */ }
            </div>
        );
    }
}



export class LogViewState {
  items: Logger.LogItem[];
}
export class LogView extends React.Component<any, LogViewState> {
  constructor(props: any) {
    super(props);
    this.state = { items: Logger.Log.items };
    Logger.Log.onItemsChanged((items: Logger.LogItem[]) => {
      this.setState({ items: items });
    });
  }
  render() {
    var nodes = this.state.items.map((item: Logger.LogItem) => {
      return (
          <li key={item.stamp}>
            <span className="timestamp">{ item.stamp }</span>
            <span className="path">{ item.path }</span>
            <span className="message">{ item.message }</span>
          </li>
      );
    });
    return (
      <div className="log-view">
        <h1>Log</h1>
        <ul>
          { nodes }
        </ul>
      </div>
    );
  }
}
