/// <reference path="./typings/tsd.d.ts" />
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", 'react/addons', './SynchedObject', './Navigation', './Reconciliation'], function (require, exports, React, Sync, Nav, Rec) {
    var Bootstrap = (function () {
        function Bootstrap() {
        }
        Bootstrap.prototype.start = function () {
            React.initializeTouchEvents(true);
            React.render(React.createElement(MainView, null), document.body);
        };
        return Bootstrap;
    })();
    exports.Bootstrap = Bootstrap;
    var MainView = (function (_super) {
        __extends(MainView, _super);
        function MainView(props) {
            var _this = this;
            _super.call(this, props);
            var rec = JSON.parse(localStorage.getItem('reconciliation')) || {};
            var sync = new Sync.SyncedObject('reconciliation');
            sync.setByPath('tickets.New1.key', 'New1');
            sync.setByPath('tickets.New1.name', 'A new 1!');
            sync.setByPath('tickets.New2.key', 'New2');
            sync.setByPath('tickets.New2.name', 'A new 2!');
            this.state = {
                reconciliation: sync.get(),
                isNavOpen: false
            };
            sync.__.onUpdated(function (updated) {
                console.log("HEEERRRR!!!!!", updated, sync.get());
                _this.setState({ reconciliation: updated });
            });
            console.log(this.state);
        }
        MainView.prototype.closeNav = function () {
            this.setState({ isNavOpen: false });
        };
        MainView.prototype.render = function () {
            var _this = this;
            console.log('Render: MainView');
            var className = this.state.isNavOpen ? 'open' : '';
            return (React.createElement("div", null, React.createElement("div", {"className": "sticky-header"}, React.createElement("ul", {"className": className}, React.createElement("li", {"className": "hamburger-icon", "onClick": function () { _this.setState({ isNavOpen: !_this.state.isNavOpen }); }}, React.createElement("span", {"className": "col-2 fa fa-bars"})), React.createElement("li", null, React.createElement(Nav.NavigationItem, {"hash": "#", "onSelect": function () { _this.closeNav(); }}, React.createElement("span", {"className": "col-2"}, "RMS"))), React.createElement("li", {"className": "hamburger"}, React.createElement(Nav.NavigationItem, {"hash": "#reconciliation", "onSelect": function () { _this.closeNav(); }}, React.createElement("span", {"className": "col-6"}, "Reconciliation"))), React.createElement("li", {"className": "hamburger"}, React.createElement(Nav.NavigationItem, {"hash": "#menu", "onSelect": function () { _this.closeNav(); }}, React.createElement("span", {"className": "col-5"}, "Menu"))), React.createElement("li", {"className": "hamburger"}, React.createElement(Nav.NavigationItem, {"hash": "#kitchen", "onSelect": function () { _this.closeNav(); }}, React.createElement("span", {"className": "col-5"}, "Kitchen"))))), React.createElement(Nav.NavigationView, {"hash": "#"}, React.createElement("h1", null, "Welcome to RMS"), React.createElement("p", null, "There will be a dashboard here later."), React.createElement("p", null, "Use the navigation above to select a location.")), React.createElement(Nav.NavigationView, {"hash": "#reconciliation"}, React.createElement(Rec.ReconciliationView, {"reconciliation": this.state.reconciliation}))));
        };
        return MainView;
    })(React.Component);
    exports.MainView = MainView;
});
//# sourceMappingURL=Views.js.map