/// <reference path="./typings/tsd.d.ts" />
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", 'react/addons', './SyncNodeSocket', './Navigation', './Reconciliation', './Menu', './Logger'], function (require, exports, React, Sync, Nav, Rec, Menu, Logger) {
    'use strict';
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
            var defaultRec;
            defaultRec = {
                name: 'Test Rec',
                tickets: { '0': { key: '0', name: 'Justin2' } },
                menu: { categories: { items: {} } }
            };
            var sync = new Sync.SyncNodeSocket('/reconciliation', defaultRec);
            sync.onStatusChanged = function (path, status) {
                _this.setState({ syncSocketStatus: status });
            };
            sync.onUpdated(function (updated) {
                console.log('     setting state: ', updated);
                _this.setState({ reconciliation: updated });
            });
            this.state = {
                reconciliation: sync.get(),
                isNavOpen: false,
                syncSocketStatus: sync.status
            };
        }
        MainView.prototype.closeNav = function () {
            this.setState({ isNavOpen: false });
        };
        MainView.prototype.render = function () {
            var _this = this;
            console.log('Render: MainView');
            var className = (this.state.isNavOpen ? 'open' : '');
            return (React.createElement("div", null, React.createElement("div", {"className": "sticky-header"}, React.createElement("ul", {"className": className}, React.createElement("li", {"className": "hamburger-icon", "onClick": function () { _this.setState({ isNavOpen: !_this.state.isNavOpen }); }}, React.createElement("span", {"className": "col-2 fa fa-bars"})), React.createElement("li", null, React.createElement(Nav.NavigationItem, {"hash": "#", "onSelect": function () { _this.closeNav(); }}, React.createElement("span", {"className": "col-2"}, "RMS"))), React.createElement("li", {"className": "hamburger"}, React.createElement(Nav.NavigationItem, {"hash": "#reconciliation", "onSelect": function () { _this.closeNav(); }}, React.createElement("span", {"className": "col-6"}, "Reconciliation"))), React.createElement("li", {"className": "hamburger"}, React.createElement(Nav.NavigationItem, {"hash": "#menu", "onSelect": function () { _this.closeNav(); }}, React.createElement("span", {"className": "col-5"}, "Menu"))), React.createElement("li", {"className": "hamburger"}, React.createElement(Nav.NavigationItem, {"hash": "#kitchen", "onSelect": function () { _this.closeNav(); }}, React.createElement("span", {"className": "col-5"}, "Kitchen"))))), React.createElement(Nav.NavigationView, {"hash": "#"}, React.createElement("h1", null, "Welcome to RMS"), React.createElement("p", null, "There will be a dashboard here later."), React.createElement("p", null, "Use the navigation above to select a location."), React.createElement(LogView, {"ref": "logView"})), React.createElement(Nav.NavigationView, {"hash": "#reconciliation"}, React.createElement(Rec.ReconciliationView, {"reconciliation": this.state.reconciliation})), React.createElement(Nav.NavigationView, {"hash": "#menu"}, React.createElement(Menu.MenuEdit, {"menu": this.state.reconciliation.menu})), React.createElement(Nav.NavigationView, {"hash": "#kitchen"}, React.createElement("h1", null, "The kitchen!")), "*/  }"));
        };
        return MainView;
    })(React.Component);
    exports.MainView = MainView;
    var LogViewState = (function () {
        function LogViewState() {
        }
        return LogViewState;
    })();
    exports.LogViewState = LogViewState;
    var LogView = (function (_super) {
        __extends(LogView, _super);
        function LogView(props) {
            var _this = this;
            _super.call(this, props);
            this.state = { items: Logger.Log.items };
            Logger.Log.onItemsChanged(function (items) {
                _this.setState({ items: items });
            });
        }
        LogView.prototype.render = function () {
            var key = 0;
            var nodes = this.state.items.map(function (item) {
                return (React.createElement("li", {"className": item.type, "key": key++}, React.createElement("span", {"className": "timestamp"}, item.stamp), React.createElement("span", {"className": "path"}, item.path), React.createElement("span", {"className": "message"}, item.message)));
            });
            return (React.createElement("div", {"className": "log-view"}, React.createElement("h1", null, "Log"), React.createElement("ul", null, nodes)));
        };
        return LogView;
    })(React.Component);
    exports.LogView = LogView;
});
//# sourceMappingURL=Views.js.map