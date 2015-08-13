/// <reference path="../typings/tsd.d.ts" />
/// <reference path="./Models.ts" />
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", 'react/addons', 'Models', './BaseViews'], function (require, exports, React, models, baseViews) {
    var VendorDetailsView = (function (_super) {
        __extends(VendorDetailsView, _super);
        function VendorDetailsView() {
            _super.apply(this, arguments);
        }
        VendorDetailsView.prototype.render = function () {
            return (React.createElement("div", {"key": this.props.entity._id}, React.createElement("input", {"value": this.state.entity.name, "onChange": this.handleChange.bind(this, "name")}), React.createElement("input", {"value": this.state.entity.note, "onChange": this.handleChange.bind(this, "note")}), React.createElement("button", {"onClick": this.update.bind(this), "disabled": !this.state.isDirty}, "Update"), React.createElement("button", {"onClick": this.remove.bind(this)}, "X")));
        };
        return VendorDetailsView;
    })(baseViews.BaseItemView);
    exports.VendorDetailsView = VendorDetailsView;
    var VendorsView = (function (_super) {
        __extends(VendorsView, _super);
        function VendorsView(props) {
            _super.call(this, props, models.VendorModel.collectionName);
            this.state.isDisabled = true;
        }
        VendorsView.prototype.insert = function () {
            this.insertBase({
                name: React.findDOMNode(this.refs['name'])['value'],
                note: ''
            });
        };
        VendorsView.prototype.render = function () {
            var nodes = this.state.data.map(function (entity) {
                return (React.createElement(VendorDetailsView, {"key": entity._id, "entity": entity, "onUpdate": this.update.bind(this), "onRemove": this.remove.bind(this)}));
            }.bind(this));
            var style = {
                display: this.state.isDisabled ? 'none' : 'block'
            };
            return (React.createElement("div", null, React.createElement("div", {"onClick": this.toggleIsDisabled.bind(this)}, React.createElement("h2", null, "Vendors")), React.createElement("div", {"style": style}, React.createElement("input", {"ref": "name"}), React.createElement("button", {"onClick": this.insert.bind(this)}, "Add"), nodes)));
        };
        return VendorsView;
    })(baseViews.BaseView);
    exports.VendorsView = VendorsView;
});
//# sourceMappingURL=VendorViews.js.map