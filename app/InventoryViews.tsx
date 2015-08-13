/// <reference path="../typings/tsd.d.ts" />
/// <reference path="./Models.ts" />

import React = require('react/addons');
import $ = require('jquery');
import io = require('socket.io');
import moment = require('moment');
import models = require('Models');

import baseViews = require('./BaseViews');



export class InventoryView extends baseViews.BaseView<models.InventoryItemModel, {}, any> {
    constructor(props) {
        super(props, models.InventoryItemModel.collectionName);
        //this.state.isDisabled = true;
    }
    insert() {
        this.insertBase({
            name: React.findDOMNode(this.refs['name'])['value'],
            note: "",
            count: 0
        });
    }
    render() {
        var nodes = this.state.data.map(function(entity) {
            return (
                <InventoryItemView key={entity._id} entity={entity} onUpdate={this.update.bind(this) } onRemove={this.remove.bind(this) }></InventoryItemView>
            );
        }.bind(this));

        var style = {
            display: this.state.isDisabled ? 'none' : 'block'
        };

        return (
            <div>
              <div onClick={ this.toggleIsDisabled.bind(this) }>
                <h2>Inventory</h2>
              </div>
              <div style={style}>
                <input ref="name" />
                <button onClick={this.insert.bind(this) }>Add</button>
                {nodes}
              </div>
            </div>
        );
    }
}


export class InventoryItemView extends baseViews.BaseItemView<baseViews.BaseItemViewProps, any> {
    render() {
        return (
            <div key={this.props.entity._id}>
            <select value={this.state.entity.location} onChange={ this.handleChange.bind(this, "location") } >
                    <option></option>
                    <option>Dry Storage</option>
                    <option>Silver Fridge</option>
                    <option>Freezer 1</option>
                    <option>Freezer 2</option>
            </select>
                <select value={this.state.entity.type} onChange={ this.handleChange.bind(this, "type") } >
                    <option></option>
                    <option>App</option>
                    <option>Bread</option>
                    <option>Drinks</option>
                    <option>Dry Goods</option>
                    <option>Meat</option>
                    <option>Produce</option>
                    <option>Sauce</option>
                    <option>Supplies</option>
                </select>
              <input value={ this.state.entity.name } onChange={ this.handleChange.bind(this, "name") } />
              <input value={ this.state.entity.note } onChange={ this.handleChange.bind(this, "note") } />
              <input value={ this.state.entity.count } onChange={ this.handleChange.bind(this, "count") } />
              <button onClick={this.update.bind(this) } disabled={!this.state.isDirty}>Update</button>
              <button onClick={this.remove.bind(this) }>X</button>
              { moment(this.state.entity.lastModified).format('llll') }
            </div>
        );
    }
}
