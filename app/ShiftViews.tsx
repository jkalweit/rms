/// <reference path="../typings/tsd.d.ts" />
/// <reference path="./Models.ts" />

import React = require('react/addons');
import $ = require('jquery');
import io = require('socket.io');
import moment = require('moment');
import models = require('Models');

import baseViews = require('./BaseViews');




export class ShiftsView extends baseViews.BaseView<models.ShiftModel, {}, any> {
    constructor(props) {
        super(props, models.ShiftModel.collectionName);
        this.state.isDisabled = true;
    }
    insert() {
        this.insertBase({
            date: React.findDOMNode(this.refs['date'])['value'],
        });
    }
    handleMakeCopy(copy) {
        this.insertBase(copy);
    }
    render() {
        var nodes = this.state.data.map(function(entity) {
            return (
                <ShiftDetailsView key={entity._id} entity={entity} onUpdate={this.update.bind(this) } onRemove={this.remove.bind(this) } onMakeCopy={this.handleMakeCopy.bind(this) }></ShiftDetailsView>
            );
        }.bind(this));

        var style = {
            display: this.state.isDisabled ? 'none' : 'block'
        };

        return (
            <div>
              <div onClick={ this.toggleIsDisabled.bind(this) }>
                <h2>Shifts</h2>
              </div>
              <div style={style}>
                <input ref="date" type="date" />
                <button onClick={this.insert.bind(this) }>Add</button>
                {nodes}
              </div>
            </div>
        );
    }
}

export class ShiftDetailsViewProps extends baseViews.BaseItemViewProps {
    public onMakeCopy: any;
}

export class ShiftDetailsView extends baseViews.BaseItemView<ShiftDetailsViewProps, any> {
    insert() {
        var newEntity = this.state.entity as models.ShiftModel;
        newEntity.positions = newEntity.positions || [];
        newEntity.positions.push({
            name: '',
            employee: '',
            date: newEntity.date,
            start: '16:30',
            end: '21:30'
        });
        this.setState({
            entity: newEntity,
            isDirty: true
        });
    }
    handlePostionUpdate(entity) {
        this.update();
    }
    handlePostionRemove(id) {
        var newEntity = this.state.entity;
        for (var i = 0; i < newEntity.positions.length; i++) {
            if (newEntity.positions[i]._id === id) {
                newEntity.positions.splice(i, 1);
                this.setState({
                    entity: newEntity,
                    isDirty: true
                });
                this.update();
                return;
            }
        }
    }
    copy() {
        var newEntity = this.state.entity;
        delete newEntity._id;
        this.props.onMakeCopy(newEntity);
    }
    render() {
        var nodes = [];
        if (this.state.entity.positions) {
            nodes = this.state.entity.positions.map(function(position) {
                return (
                    <ShiftPositionDetailsView key={position._id} entity={position} onUpdate={this.handlePostionUpdate.bind(this) } onRemove={this.handlePostionRemove.bind(this) }></ShiftPositionDetailsView>
                );
            }.bind(this));
        }
        return (
            <div>
            { moment(this.state.entity.date).format('dddd') }
            <input value={ this.state.entity.date } type="date" onChange={ this.handleChange.bind(this, "date") } />
            <button onClick={this.insert.bind(this) }>Add Position</button>
            <button onClick={this.update.bind(this) } disabled={!this.state.isDirty}>Update</button>
            <button onClick={this.remove.bind(this) }>X</button>
            <button onClick={this.copy.bind(this) }>Copy</button>
            { nodes }
            </div>
        );
    }
}

export class ShiftPositionDetailsView extends baseViews.BaseItemView<baseViews.BaseItemViewProps, any> {
    render() {
        return (
            <div key={this.props.entity._id}>
            <input value={ this.state.entity.name } onChange={ this.handleChange.bind(this, "name") } />
            <select value={ this.state.entity.employee } onChange={ this.handleChange.bind(this, "employee") }>
              <option></option>
              <option>Chris</option>
              <option>Jake</option>
              <option>Justin</option>
              <option>Matt</option>
              <option>Michael</option>
              <option>Aerin</option>
              <option>Keely</option>
              <option>Kelly</option>
              <option>Merrill</option>
              <option>Stassie</option>
            </select>
            <input value={ this.state.entity.start } type="time" onChange={ this.handleChange.bind(this, "start") } />
            <input value={ this.state.entity.end } type="time" onChange={ this.handleChange.bind(this, "end") } />
            { models.ShiftModel.shiftLength(this.state.entity) }
            <button onClick={this.update.bind(this) } disabled={!this.state.isDirty}>Update</button>
            <button onClick={this.remove.bind(this) }>X</button>
            </div>
        );
    }
}
