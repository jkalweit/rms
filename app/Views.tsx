/// <reference path="../typings/tsd.d.ts" />
/// <reference path="./Models.ts" />


import React = require('react/addons');

import models = require('./Models');

import Store = require('./Store');

import bv = require('./BaseViews');
import vendorViews = require('./vendorViews');
import inventoryViews = require('./InventoryViews');
import shiftViews = require('./shiftViews');
import kitchenViews = require('./KitchenViews');
import menuViews = require('./MenuViews');
import recViews = require('./ReconciliationViews');


React.initializeTouchEvents(true);

export interface NavigatorProps {
    hash: string;
    children?: any;
    onSelect?: (url: string) => void;
}
export interface NavigationState {
  isSelected?: boolean;
}
export class NavigationBase extends bv.FreezerView<NavigatorProps, NavigationState> {
    constructor(props) {
        super(props);
        this.state = { isSelected: this.compareHash() };
        window.addEventListener('hashchange', () => {
            this.setState({ isSelected: this.compareHash() });
        });
    }
    compareHash(): boolean {
        var normalizedHash = (location.hash || '').toLowerCase();
        if (normalizedHash == '') normalizedHash = '#';

        return normalizedHash == this.props.hash;
    }
    render() {
        return (<div>Navigator Base is an abstract class.You must implement your own render().</div>);
    }
}


export class NavigationView extends NavigationBase {
    render() {
        var style = {
            zIndex: this.state.isSelected ? 1 : 0,
            opacity: this.state.isSelected ? 1 : 0
        };

        return (
            <div className="navigation-view" style={style}>
              { this.props.children }
            </div>
        );
    }
}

export class NavigationItem extends NavigationView {
    render() {
        var className = this.state.isSelected ? 'active' : '';
        return (
            <a className={className} onClick={ () => { this.props.onSelect(this.props.hash); }} href={this.props.hash}>
              { this.props.children }
            </a>
        );
    }
}





export interface MainViewState {
    reconciliation?: models.Reconciliation;
    isNavOpen?: boolean;
}
export class MainView extends React.Component<{}, MainViewState> {
    constructor(props) {
        super(props);
        this.state = {
            reconciliation: Store.reconciliation,
            isNavOpen: false
        };
    }
    componentDidMount() {
        Store.onChanged = (updated) => {
            console.log('Store Changed!');
            console.log(updated);
            this.setState({
                reconciliation: updated
            });
        };
    }
    closeNav() {
      this.setState({ isNavOpen: false });
    }
    render() {
        var rec = this.state.reconciliation;
        var className = this.state.isNavOpen ? 'open' : '';
        return (
            <div>
            <div className="sticky-header">
              <ul className={className}>
                <li className="hamburger-icon" onClick={() => { this.setState({ isNavOpen: !this.state.isNavOpen }) }}><span className="col-2 fa fa-bars"></span></li>
                <li><NavigationItem hash="#" onSelect={ () => { this.closeNav(); }}><span className="col-2">RMS</span></NavigationItem></li>
                <li className="hamburger"><NavigationItem hash="#reconciliation" onSelect={ () => { this.closeNav(); }}><span className="col-6">Reconciliation</span></NavigationItem></li>
                <li className="hamburger"><NavigationItem hash="#menu" onSelect={ () => { this.closeNav(); }}><span className="col-5">Menu</span></NavigationItem></li>
                <li className="hamburger"><NavigationItem hash="#kitchen" onSelect={ () => { this.closeNav(); }}><span className="col-5">Kitchen</span></NavigationItem></li>
              </ul>
            </div>
            <NavigationView hash="#">
              <h1>Welcome to RMS</h1>
              <p>There will be a dashboard here later.</p>
              <p>Use the navigation above to select a location.</p>
            </NavigationView>
            <NavigationView hash="#reconciliation"><recViews.ReconciliationView tickets={rec.tickets} menu={rec.menu}></recViews.ReconciliationView></NavigationView>
            <NavigationView hash="#menu"><menuViews.MenuEditView menu={rec.menu}></menuViews.MenuEditView></NavigationView>
            <NavigationView hash="#kitchen"><h1>The kitchen!</h1></NavigationView>
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
