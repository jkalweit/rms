/// <reference path="../typings/tsd.d.ts" />
/// <reference path="./Models.ts" />

import React = require('react/addons');
import $ = require('jquery');
import io = require('socket.io');
import moment = require('moment');
import models = require('Models');

import baseViews = require('./BaseViews');



export class VendorDetailsView extends baseViews.BaseItemView<baseViews.BaseItemViewProps, any> {
    render() {
        return (
            <div key={this.props.entity._id}>
            <input value={ this.state.entity.name } onChange={ this.handleChange.bind(this, "name") } />
            <input value={ this.state.entity.note } onChange={ this.handleChange.bind(this, "note") } />
            <button onClick={this.update.bind(this) } disabled={!this.state.isDirty}>Update</button>
            <button onClick={this.remove.bind(this) }>X</button>
            </div>
        );
    }
}


export class VendorsView extends baseViews.BaseView<models.VendorModel, {}, any> {
    constructor(props) {
        super(props, models.VendorModel.collectionName);
        this.state.isDisabled = true;
    }
    insert() {
        this.insertBase({
            name: React.findDOMNode(this.refs['name'])['value'],
            note: ''
        });
    }
    render() {
        var nodes = this.state.data.map(function(entity) {
            return (
                <VendorDetailsView key={entity._id} entity={entity} onUpdate={this.update.bind(this) } onRemove={this.remove.bind(this) }></VendorDetailsView>
            );
        }.bind(this));

        var style = {
            display: this.state.isDisabled ? 'none' : 'block'
        };

        return (
            <div>
              <div onClick={ this.toggleIsDisabled.bind(this) }>
                <h2>Vendors</h2>
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
