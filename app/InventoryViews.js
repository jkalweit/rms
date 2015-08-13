/// <reference path="../typings/tsd.d.ts" />
/// <reference path="./Models.ts" />
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", 'react/addons', 'moment', 'Models', './BaseViews'], function (require, exports, React, moment, models, baseViews) {
    var InventoryView = (function (_super) {
        __extends(InventoryView, _super);
        function InventoryView(props) {
            _super.call(this, props, models.InventoryItemModel.collectionName);
        }
        InventoryView.prototype.insert = function () {
            this.insertBase({
                name: React.findDOMNode(this.refs['name'])['value'],
                note: "",
                count: 0
            });
        };
        InventoryView.prototype.render = function () {
            var nodes = this.state.data.map(function (entity) {
                return (React.createElement(InventoryItemView, {"key": entity._id, "entity": entity, "onUpdate": this.update.bind(this), "onRemove": this.remove.bind(this)}));
            }.bind(this));
            var style = {
                display: this.state.isDisabled ? 'none' : 'block'
            };
            return (React.createElement("div", null, React.createElement("div", {"onClick": this.toggleIsDisabled.bind(this)}, React.createElement("h2", null, "Inventory")), React.createElement("div", {"style": style}, React.createElement("input", {"ref": "name"}), React.createElement("button", {"onClick": this.insert.bind(this)}, "Add"), nodes)));
        };
        return InventoryView;
    })(baseViews.BaseView);
    exports.InventoryView = InventoryView;
    var InventoryItemView = (function (_super) {
        __extends(InventoryItemView, _super);
        function InventoryItemView() {
            _super.apply(this, arguments);
        }
        InventoryItemView.prototype.render = function () {
            return (React.createElement("div", {"key": this.props.entity._id}, React.createElement("select", {"value": this.state.entity.location, "onChange": this.handleChange.bind(this, "location")}, React.createElement("option", null), React.createElement("option", null, "Dry Storage"), React.createElement("option", null, "Silver Fridge"), React.createElement("option", null, "Freezer 1"), React.createElement("option", null, "Freezer 2")), React.createElement("select", {"value": this.state.entity.type, "onChange": this.handleChange.bind(this, "type")}, React.createElement("option", null), React.createElement("option", null, "App"), React.createElement("option", null, "Bread"), React.createElement("option", null, "Drinks"), React.createElement("option", null, "Dry Goods"), React.createElement("option", null, "Meat"), React.createElement("option", null, "Produce"), React.createElement("option", null, "Sauce"), React.createElement("option", null, "Supplies")), React.createElement("input", {"value": this.state.entity.name, "onChange": this.handleChange.bind(this, "name")}), React.createElement("input", {"value": this.state.entity.note, "onChange": this.handleChange.bind(this, "note")}), React.createElement("input", {"value": this.state.entity.count, "onChange": this.handleChange.bind(this, "count")}), React.createElement("button", {"onClick": this.update.bind(this), "disabled": !this.state.isDirty}, "Update"), React.createElement("button", {"onClick": this.remove.bind(this)}, "X"), moment(this.state.entity.lastModified).format('llll')));
        };
        return InventoryItemView;
    })(baseViews.BaseItemView);
    exports.InventoryItemView = InventoryItemView;
});
//# sourceMappingURL=InventoryViews.js.map