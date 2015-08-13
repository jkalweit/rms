/// <reference path="../typings/tsd.d.ts" />

import React = require('react/addons');
import $ = require('jquery');
import io = require('socket.io');
import moment = require('moment');

import models = require('./Models');
import dataStores = require('./DataStores');


export class Utils {
    static FormatDollars(value, precision: number = 2): string {
        var val = Number(value);
        return '$' + val.toFixed(2)
    }
}

export class FreezerView<P, S> extends React.Component<P, S> {
    name: string = 'FreezerView'; //override for debugging
    isShallowDiff(curr: any, next: any): boolean {
        var equal = true;
        if (curr === null || next === null || typeof curr !== 'object' || typeof next !== 'object') {
            //console.log('isShallowDiff: an argument is either null or not an object, doing === compare.');
            return curr !== next;
        }
        Object.keys(next).forEach((key) => {
            if (typeof next[key] === 'function') {
                //ignore functions
            }
            else if ((next[key] !== curr[key])) {
                //console.log(this.name + ' DIFF: ' + key + ': ' + next[key]);
                equal = false;
            }
        });
        return !equal;
    }
    shouldComponentUpdate(nextProps: P, nextState: S) {
        var propsDiff = this.isShallowDiff(this.props, nextProps);
        var stateDiff = this.isShallowDiff(this.state, nextState);
        var shouldUpdate = propsDiff || stateDiff;
        //if (shouldUpdate) console.log(this.name + ': UPDATE');
        return shouldUpdate;
    }
}







export class Button extends React.Component<any, any> {
    constructor(props) {
        super(props);
        this.state = {
          isPressed: false
        }
    }
    handleClick(e) {
        this.setState({ isPressed: true });
        setTimeout(() => { this.setState({ isPressed: false })}, 100); // set ms to twice the transition for in and out.
        if (this.props.onClick) this.props.onClick(e);
    }
    render() {
        var classes = this.props.className || "";
        classes = 'btn ' + classes + (this.state.isPressed ? ' pressed' : '');
        return (
            <button className={classes} style={this.props.style} onClick={(e) => { this.handleClick(e) } }>{this.props.children}</button>
        );
    }

}


export class BaseViewProps {
    public key: string;
    public entity: any;
}


export interface BaseItemViewProps extends BaseViewProps {
    onUpdate?: any;
    onRemove?: any;
}


export class BaseView<T extends models.DbObjectModel, P, S> extends React.Component<P, any> {
    collectionName: string;
    private socketSubscriptions: any;
    private dataStore: dataStores.IDataStore<T>;
    constructor(props, collectionName: string) {
        super(props);
        this.collectionName = collectionName;
        this.state = {
            data: [],
            isDisabled: false
        };

        //this.dataStore = new dataStores.LocalPersistence<T>('inventory_items', callbacks);
        this.dataStore = new dataStores.SocketIODataStore<T>(collectionName);
        this.dataStore.on('queryed', this.handleRefresh.bind(this));
        this.dataStore.on('inserted', this.refresh.bind(this));
        this.dataStore.on('updated', this.refresh.bind(this));
        this.dataStore.on('removed', this.refresh.bind(this));
        this.dataStore.init();
    }
    toggleIsDisabled() {
        this.setState({ isDisabled: !this.state.isDisabled });
    }
    componentDidMount() {
        this.refresh();
    }
    refresh() {
        this.dataStore.query();
    }
    handleRefresh(data) {
        this.setState({ data: data });
    }
    insertBase(item) {
        this.dataStore.insert(item);
    }
    update(data) {
        var me = this;
        this.dataStore.update(data);
    }
    remove(id) {
        var me = this;
        this.dataStore.remove(id);
    }
}

export class BaseItemView<P extends BaseItemViewProps, S> extends React.Component<P, any> {
    private collectionName: string;
    constructor(props) {
        super(props);
        this.state = {
            entity: props.entity,
            isDirty: false,
            isDisabled: false
        };
    }
    toggleIsDisabled() {
        this.setState({ isDisabled: !this.state.isDisabled });
    }
    componentWillReceiveProps(nextProps) {
        this.setState({
            entity: nextProps.entity,
            isDirty: false
        });
    }
    update() {
        var me = this;
        this.props.onUpdate(this.state.entity);
    }
    remove() {
        if (confirm('Delete?')) {
            this.props.onRemove(this.props.entity._id);
        }
    }
    handleChange(fieldName, event) {
        var newEntity = this.state.entity;
        if (newEntity[fieldName] !== event.target.value) {
            newEntity[fieldName] = event.target.value;
            this.setState({
                entity: newEntity,
                isDirty: true
            });
        }
    }
    render() {
        return (
            <div>
            { (this.props as any).children }
            </div>
        );
    }
}

export class SimpleItemEditView extends React.Component<any, any> {
    private collectionName: string;
    constructor(props) {
        super(props);
        var entityCopy = {};
        if (props.entity) {
            entityCopy = JSON.parse(JSON.stringify(props.entity));
        }
        this.state = {
            entity: entityCopy,
            isDirty: false,
            isDisabled: false
        };
    }
    toggleIsDisabled() {
        this.setState({ isDisabled: !this.state.isDisabled });
    }
    componentWillReceiveProps(nextProps) {
        var entityCopy = {};
        if (nextProps.entity) {
            entityCopy = JSON.parse(JSON.stringify(nextProps.entity));
        }
        this.setState({
            entity: entityCopy,
            isDirty: false
        });
    }
    handleChange(fieldName, event) {
        var newEntity = this.state.entity;
        if (newEntity[fieldName] !== event.target.value) {
            newEntity[fieldName] = event.target.value;
            this.setState({
                entity: newEntity,
                isDirty: true
            });
        }
    }
    reset() {
        this.setState({
            entity: JSON.parse(JSON.stringify(this.props.entity)),
            isDirty: false
        });
    }
    save() {
        this.props.onSave(this.state.entity);
    }
    cancel() {
        this.props.onCancel();
    }
    remove() {
        this.props.onRemove();
    }
    render() {
        return (
            <div>
            { (this.props as any).children }
            </div>
        );
    }
}

export class SimpleConfirmView extends React.Component<any, any> {
   doCallback(name) {
     if(this.props[name]) this.props[name]();
   }
   render() {

     var hide = { display: this.props.onRemove ? 'block' : 'none' };
     var style = {
       clear: 'both',
       margin: '10px',
       minHeight: '40px',
       position: 'absolute',
       bottom: 0,
       left: 0
     };

     return (
       <div style={style}>
         <Button className="col-4 btn-confirm" onClick={() => { this.doCallback('onSave'); }} disabled={!this.props.isDirty}>Save</Button>
         <Button className="col-4 btn-cancel" onClick={() => { this.doCallback('onCancel'); }}>Cancel</Button>
         <Button className="col-4 btn-delete" onClick={() => { this.doCallback('onRemove'); }} style={hide}>Delete</Button>
       </div>
      );
   }
}




export class ModalView extends React.Component<any, any> {
    constructor(props, collectionName: string) {
        super(props);
        this.state = {
            isVisible: false
        };
    }
    show(callback: () => void) {
        this.setState({
            isVisible: true
        }, () => {
          if(callback) callback();
          if (this.props.onShown) this.props.onShown()
          });
    }
    hide() {
        this.setState({
            isVisible: false
        });
    }
    toggle() {
        this.setState({
            isVisible: !this.state.isVisible
        }, () => {
            if (this.state.isVisible && this.props.onShown) { this.props.onShown(); }
        });
    }
    render() {
        var backdropStyle = {
            display: this.state.isVisible ? 'block' : 'none',
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            zIndex: 10,
            backgroundColor: 'rgba(0,0,0,0.5)'
        };
        var innerStyle = {
            borderRadius: '5px',
            backgroundColor: '#FFFFFF',
            color: '#000000',
            minWidth: '400px',
            maxWidth: '600px',
            width: '80%',
            margin: '20px auto',
            padding: '40px'
        };
        return (
            <div style={backdropStyle}>
              <div style={innerStyle}>
                { this.props.children }
              </div>
            </div>
        );
    }
}
