/// <reference path="./typings/tsd.d.ts" />


import React = require('react/addons');
//import Hammer = require('hammerjs');
import Sync = require('./SyncNodeSocket');
import Models = require('./Models');
import Nav = require('./Navigation');
import Logger = require('./Logger');
import Rec = require('./Reconciliation');
import Menu = require('./Menu');
import Kitchen = require('./Kitchen');
import Flow = require('./Flow');


'use strict';

//declare var Hammer: any;

export class Bootstrap {
    start() {
        //var hammertime = new Hammer(document.body);
        React.initializeTouchEvents(true);
        React.render(React.createElement(MainView, null), document.body);
    }
}



export interface NavigationInfo {
  path?: string[];
  query?: {[key: string]: string | boolean};
}
export interface MainViewState {
    reconciliation?: Models.Reconciliation;
    diagrams?: Models.FlowDiagrams;
    kitchen?: Models.Kitchen;
    isNavOpen?: boolean;
    syncSocketStatus?: string;

    nav?: NavigationInfo;
}
export class MainView extends React.Component<{}, MainViewState> {
    constructor(props: {}) {
        super(props);

        var recSync = this.startReconciliationConnection();
        var flowSync = this.startFlowDiagramsConnection();
        var kitchenSync = this.startKitchenConnection();
        //console.log('sync.get: ', sync.get());

        window.addEventListener('hashchange', () => {
          console.log('hashchange!', location.hash);
          this.setState({ nav: this.parseHash() });
        });

        this.state = {
            reconciliation: recSync.get(),
            diagrams: flowSync.get(),
            kitchen: kitchenSync.get(),
            isNavOpen: false,
            syncSocketStatus: recSync.status,
            nav: this.parseHash()
        };
    }
    parseHash(): NavigationInfo {
        var split = location.hash.split('?');

        var normalizedHash = (split[0] || ''); //.toLowerCase();
        if (normalizedHash == '') normalizedHash = '#';

        var path = normalizedHash.split('/');

        var query: {[key: string]: string | boolean} = {};
        if(split.length > 1) {
          var querySplit = split[1].split('&');
          querySplit.forEach((param: string) => {
            var paramSplit = param.split('=');
            var value: any = true;
            if(paramSplit.length > 1) {
              value = paramSplit[1];
            }
            query[paramSplit[0]] = value;
          });
        }
        var state = { path: path, query: query };
        //console.log('state', state);
        return state;
    }
    closeNav() {
        this.setState({ isNavOpen: false });
    }
    startReconciliationConnection(): Sync.SyncNodeSocket<Models.Reconciliation> {
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
          console.log('updated Rec!', updated);
          this.setState({ reconciliation: updated });
      });

      return sync;
    }
    startFlowDiagramsConnection(): Sync.SyncNodeSocket<Models.FlowDiagrams> {
      var defaultDiagrams: Models.FlowDiagrams;
      defaultDiagrams = {
          diagrams: {
              '0': {
                  key: '0',
                  name: 'New Diagram',
                  items: {
                  }
              }
          }
      };

      var sync = new Sync.SyncNodeSocket<Models.FlowDiagrams>('/flowdiagrams', defaultDiagrams);

      sync.onUpdated((updated: Models.FlowDiagrams) => {
          console.log('updated Diagrams!', updated);
          this.setState({ diagrams: updated });
      });
      return sync;
    }
    startKitchenConnection(): Sync.SyncNodeSocket<Models.Kitchen> {
      var defaultKitchen: Models.Kitchen = {
          orders: {}
      };
      var sync = new Sync.SyncNodeSocket<Models.Kitchen>('/kitchen', defaultKitchen);
      sync.onUpdated((updated: Models.Kitchen) => {
          console.log('updated Kitchen!', updated);
          this.setState({ kitchen: updated });
      });
      sync.server.on('newKitchenOrder', (merge: any) => {
          React.findDOMNode(this.refs['newKitchenOrderSound'])['play']();
      });
      return sync;
    }
    render() {
        //var rec = this.state.reconciliation;
        //console.log('Render: MainView');
        var className = (this.state.isNavOpen ? 'open' : '');

        var headerClassName = 'sticky-header ' + (this.state.syncSocketStatus === 'Connected' ? '' : 'error');

        var view: any;

        var hash = this.state.nav.path[0].toLowerCase();

        if(hash == '#diagrams') {
            view = (
              <Flow.FlowDiagrams diagrams={this.state.diagrams} path={this.state.nav.path}></Flow.FlowDiagrams>
            );
        } else if(hash == "#reconciliation") {
           view = (
             <Rec.ReconciliationView reconciliation={this.state.reconciliation}></Rec.ReconciliationView>
           );
        } else if(hash == "#menu") {
          view = (
            <Menu.MenuEdit menu={this.state.reconciliation.menu}></Menu.MenuEdit>
          );
        } else if(hash == "#kitchen") {
          view = (
            <Kitchen.KitchenOrdersView orders={this.state.kitchen.orders}></Kitchen.KitchenOrdersView>
          );
        } else {
          view = (
            <div>
              <LogView ref="logView"></LogView>
            </div>
          );
        }


        return (
            <div>
            <audio ref="newKitchenOrderSound" src="/content/audio/bell.mp3" preload="auto"></audio>
            <div className={headerClassName}>
              <ul className={className}>
                <li className="hamburger-icon" onClick={() => { this.setState({ isNavOpen: !this.state.isNavOpen }) } }><span className="col-2 fa fa-bars"></span></li>
                <li><Nav.NavigationItem hash="#" onSelect={ () => { this.closeNav(); } }><span className="col-2">RMS</span></Nav.NavigationItem></li>
                <li className="hamburger"><Nav.NavigationItem hash="#reconciliation" onSelect={ () => { this.closeNav(); } }><span className="col-6">Reconciliation</span></Nav.NavigationItem></li>
                <li className="hamburger"><Nav.NavigationItem hash="#menu" onSelect={ () => { this.closeNav(); } }><span className="col-5">Menu</span></Nav.NavigationItem></li>
                <li className="hamburger"><Nav.NavigationItem hash="#diagrams" onSelect={ () => { this.closeNav(); } }><span className="col-5">Diagrams</span></Nav.NavigationItem></li>
                <li className="hamburger"><Nav.NavigationItem hash="#kitchen" onSelect={ () => { this.closeNav(); } }><span className="col-5">Kitchen</span></Nav.NavigationItem></li>
                <li className="hamburger status">Server: {this.state.syncSocketStatus}</li>
              </ul>
            </div>

            <div className='navigation-view'>
            { view }
            </div>
            { /*
            <Nav.NavigationView hash="#">
              <h1>Welcome to RMS</h1>
              <p>There will be a dashboard here later.</p>
              <p>Use the navigation above to select a location.</p>
              <LogView ref="logView"></LogView>
            </Nav.NavigationView>
            <Nav.NavigationView hash="#reconciliation"><Rec.ReconciliationView reconciliation={this.state.reconciliation}></Rec.ReconciliationView></Nav.NavigationView>
            <Nav.NavigationView hash="#menu"><Menu.MenuEdit menu={this.state.reconciliation.menu}></Menu.MenuEdit></Nav.NavigationView>
            <Nav.NavigationView hash="#kitchen"><h1>The kitchen!</h1></Nav.NavigationView>
            <Nav.NavigationView hash="#diagrams"><Flow.FlowDiagrams></Flow.FlowDiagrams></Nav.NavigationView>

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
    var key = 0;
    var nodes = this.state.items.map((item: Logger.LogItem) => {
      return (
          <li className={item.type} key={key++}>
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
