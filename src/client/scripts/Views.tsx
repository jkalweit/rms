/// <reference path="./typings/tsd.d.ts" />


import React = require('react/addons');
import Sync = require('./SyncNodeSocket');
import Models = require('./Models');
import Nav = require('./Navigation');
import Rec = require('./Reconciliation');

'use strict';


export class Bootstrap {
    start() {
        React.initializeTouchEvents(true);
        React.render(React.createElement(MainView, null), document.body);
    }
}




export interface MainViewState {
    reconciliation?: Models.Reconciliation;
    isNavOpen?: boolean;
}
export class MainView extends React.Component<{}, MainViewState> {
    constructor(props: {}) {
        super(props);


        var sync = new Sync.SyncNodeSocket<Models.Reconciliation>('/reconciliation');

        sync.onUpdated((updated: Models.Reconciliation) => {
            console.log('     setting state: ', updated);
            this.setState({ reconciliation: updated });
        });

        console.log('sync.get: ', sync.get());

        this.state = {
            reconciliation: sync.get(),
            isNavOpen: false
        };
    }
    closeNav() {
        this.setState({ isNavOpen: false });
    }
    render() {
        //var rec = this.state.reconciliation;
        console.log('Render: MainView');
        var className = this.state.isNavOpen ? 'open' : '';
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
            </Nav.NavigationView>
            <Nav.NavigationView hash="#reconciliation"><Rec.ReconciliationView reconciliation={this.state.reconciliation}></Rec.ReconciliationView></Nav.NavigationView>
            { /*
            <Nav.NavigationView hash="#menu"><menuViews.MenuEditView menu={rec.menu}></menuViews.MenuEditView></Nav.NavigationView>
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
