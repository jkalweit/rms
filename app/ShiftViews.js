/// <reference path="../typings/tsd.d.ts" />
/// <reference path="./Models.ts" />
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", 'react/addons', 'moment', 'Models', './BaseViews'], function (require, exports, React, moment, models, baseViews) {
    var ShiftsView = (function (_super) {
        __extends(ShiftsView, _super);
        function ShiftsView(props) {
            _super.call(this, props, models.ShiftModel.collectionName);
            this.state.isDisabled = true;
        }
        ShiftsView.prototype.insert = function () {
            this.insertBase({
                date: React.findDOMNode(this.refs['date'])['value'],
            });
        };
        ShiftsView.prototype.handleMakeCopy = function (copy) {
            this.insertBase(copy);
        };
        ShiftsView.prototype.render = function () {
            var nodes = this.state.data.map(function (entity) {
                return (React.createElement(ShiftDetailsView, {"key": entity._id, "entity": entity, "onUpdate": this.update.bind(this), "onRemove": this.remove.bind(this), "onMakeCopy": this.handleMakeCopy.bind(this)}));
            }.bind(this));
            var style = {
                display: this.state.isDisabled ? 'none' : 'block'
            };
            return (React.createElement("div", null, React.createElement("div", {"onClick": this.toggleIsDisabled.bind(this)}, React.createElement("h2", null, "Shifts")), React.createElement("div", {"style": style}, React.createElement("input", {"ref": "date", "type": "date"}), React.createElement("button", {"onClick": this.insert.bind(this)}, "Add"), nodes)));
        };
        return ShiftsView;
    })(baseViews.BaseView);
    exports.ShiftsView = ShiftsView;
    var ShiftDetailsViewProps = (function (_super) {
        __extends(ShiftDetailsViewProps, _super);
        function ShiftDetailsViewProps() {
            _super.apply(this, arguments);
        }
        return ShiftDetailsViewProps;
    })(baseViews.BaseItemViewProps);
    exports.ShiftDetailsViewProps = ShiftDetailsViewProps;
    var ShiftDetailsView = (function (_super) {
        __extends(ShiftDetailsView, _super);
        function ShiftDetailsView() {
            _super.apply(this, arguments);
        }
        ShiftDetailsView.prototype.insert = function () {
            var newEntity = this.state.entity;
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
        };
        ShiftDetailsView.prototype.handlePostionUpdate = function (entity) {
            this.update();
        };
        ShiftDetailsView.prototype.handlePostionRemove = function (id) {
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
        };
        ShiftDetailsView.prototype.copy = function () {
            var newEntity = this.state.entity;
            delete newEntity._id;
            this.props.onMakeCopy(newEntity);
        };
        ShiftDetailsView.prototype.render = function () {
            var nodes = [];
            if (this.state.entity.positions) {
                nodes = this.state.entity.positions.map(function (position) {
                    return (React.createElement(ShiftPositionDetailsView, {"key": position._id, "entity": position, "onUpdate": this.handlePostionUpdate.bind(this), "onRemove": this.handlePostionRemove.bind(this)}));
                }.bind(this));
            }
            return (React.createElement("div", null, moment(this.state.entity.date).format('dddd'), React.createElement("input", {"value": this.state.entity.date, "type": "date", "onChange": this.handleChange.bind(this, "date")}), React.createElement("button", {"onClick": this.insert.bind(this)}, "Add Position"), React.createElement("button", {"onClick": this.update.bind(this), "disabled": !this.state.isDirty}, "Update"), React.createElement("button", {"onClick": this.remove.bind(this)}, "X"), React.createElement("button", {"onClick": this.copy.bind(this)}, "Copy"), nodes));
        };
        return ShiftDetailsView;
    })(baseViews.BaseItemView);
    exports.ShiftDetailsView = ShiftDetailsView;
    var ShiftPositionDetailsView = (function (_super) {
        __extends(ShiftPositionDetailsView, _super);
        function ShiftPositionDetailsView() {
            _super.apply(this, arguments);
        }
        ShiftPositionDetailsView.prototype.render = function () {
            return (React.createElement("div", {"key": this.props.entity._id}, React.createElement("input", {"value": this.state.entity.name, "onChange": this.handleChange.bind(this, "name")}), React.createElement("select", {"value": this.state.entity.employee, "onChange": this.handleChange.bind(this, "employee")}, React.createElement("option", null), React.createElement("option", null, "Chris"), React.createElement("option", null, "Jake"), React.createElement("option", null, "Justin"), React.createElement("option", null, "Matt"), React.createElement("option", null, "Michael"), React.createElement("option", null, "Aerin"), React.createElement("option", null, "Keely"), React.createElement("option", null, "Kelly"), React.createElement("option", null, "Merrill"), React.createElement("option", null, "Stassie")), React.createElement("input", {"value": this.state.entity.start, "type": "time", "onChange": this.handleChange.bind(this, "start")}), React.createElement("input", {"value": this.state.entity.end, "type": "time", "onChange": this.handleChange.bind(this, "end")}), models.ShiftModel.shiftLength(this.state.entity), React.createElement("button", {"onClick": this.update.bind(this), "disabled": !this.state.isDirty}, "Update"), React.createElement("button", {"onClick": this.remove.bind(this)}, "X")));
        };
        return ShiftPositionDetailsView;
    })(baseViews.BaseItemView);
    exports.ShiftPositionDetailsView = ShiftPositionDetailsView;
});
//# sourceMappingURL=ShiftViews.js.map