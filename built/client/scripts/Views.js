/// <reference path="./typings/tsd.d.ts" />
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", 'react/addons', './SyncNodeSocket', './Navigation', './Logger', './Reconciliation', './Menu', './Kitchen', './Flow'], function (require, exports, React, Sync, Nav, Logger, Rec, Menu, Kitchen, Flow) {
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
            var recSync = this.startReconciliationConnection();
            var flowSync = this.startFlowDiagramsConnection();
            var kitchenSync = this.startKitchenConnection();
            window.addEventListener('hashchange', function () {
                console.log('hashchange!', location.hash);
                _this.setState({ nav: _this.parseHash() });
            });
            this.state = {
                reconciliation: recSync.get(),
                diagrams: flowSync.get(),
                kitchen: kitchenSync.get(),
                isNavOpen: false,
                syncSocketStatus: recSync.status,
                nav: this.parseHash()
            };
        }
        MainView.prototype.parseHash = function () {
            var split = location.hash.split('?');
            var normalizedHash = (split[0] || '');
            if (normalizedHash == '')
                normalizedHash = '#';
            var path = normalizedHash.split('/');
            var query = {};
            if (split.length > 1) {
                var querySplit = split[1].split('&');
                querySplit.forEach(function (param) {
                    var paramSplit = param.split('=');
                    var value = true;
                    if (paramSplit.length > 1) {
                        value = paramSplit[1];
                    }
                    query[paramSplit[0]] = value;
                });
            }
            var state = { path: path, query: query };
            return state;
        };
        MainView.prototype.closeNav = function () {
            this.setState({ isNavOpen: false });
        };
        MainView.prototype.startReconciliationConnection = function () {
            var _this = this;
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
                console.log('updated Rec!', updated);
                _this.setState({ reconciliation: updated });
            });
            return sync;
        };
        MainView.prototype.startFlowDiagramsConnection = function () {
            var _this = this;
            var defaultDiagrams;
            defaultDiagrams = {
                diagrams: {
                    '0': {
                        key: '0',
                        name: 'New Diagram',
                        items: {}
                    }
                }
            };
            var sync = new Sync.SyncNodeSocket('/flowdiagrams', defaultDiagrams);
            sync.onUpdated(function (updated) {
                console.log('updated Diagrams!', updated);
                _this.setState({ diagrams: updated });
            });
            return sync;
        };
        MainView.prototype.startKitchenConnection = function () {
            var _this = this;
            var defaultKitchen = {
                orders: {}
            };
            var sync = new Sync.SyncNodeSocket('/kitchen', defaultKitchen);
            sync.onUpdated(function (updated) {
                console.log('updated Kitchen!', updated);
                _this.setState({ kitchen: updated });
            });
            sync.server.on('newKitchenOrder', function (merge) {
                React.findDOMNode(_this.refs['newKitchenOrderSound'])['play']();
            });
            return sync;
        };
        MainView.prototype.render = function () {
            var _this = this;
            var className = (this.state.isNavOpen ? 'open' : '');
            var headerClassName = 'sticky-header ' + (this.state.syncSocketStatus === 'Connected' ? '' : 'error');
            var view;
            var hash = this.state.nav.path[0].toLowerCase();
            if (hash == '#diagrams') {
                view = (React.createElement(Flow.FlowDiagrams, {"diagrams": this.state.diagrams, "path": this.state.nav.path}));
            }
            else if (hash == "#reconciliation") {
                view = (React.createElement(Rec.ReconciliationView, {"reconciliation": this.state.reconciliation}));
            }
            else if (hash == "#menu") {
                view = (React.createElement(Menu.MenuEdit, {"menu": this.state.reconciliation.menu}));
            }
            else if (hash == "#kitchen") {
                view = (React.createElement(Kitchen.KitchenOrdersView, {"orders": this.state.kitchen.orders}));
            }
            else {
                view = (React.createElement("div", null, React.createElement(LogView, {"ref": "logView"})));
            }
            return (React.createElement("div", null, React.createElement("audio", {"ref": "newKitchenOrderSound", "src": "/content/audio/bell.mp3", "preload": "auto"}), React.createElement("div", {"className": headerClassName}, React.createElement("ul", {"className": className}, React.createElement("li", {"className": "hamburger-icon", "onClick": function () { _this.setState({ isNavOpen: !_this.state.isNavOpen }); }}, React.createElement("span", {"className": "col-2 fa fa-bars"})), React.createElement("li", null, React.createElement(Nav.NavigationItem, {"hash": "#", "onSelect": function () { _this.closeNav(); }}, React.createElement("span", {"className": "col-2"}, "RMS"))), React.createElement("li", {"className": "hamburger"}, React.createElement(Nav.NavigationItem, {"hash": "#reconciliation", "onSelect": function () { _this.closeNav(); }}, React.createElement("span", {"className": "col-6"}, "Reconciliation"))), React.createElement("li", {"className": "hamburger"}, React.createElement(Nav.NavigationItem, {"hash": "#menu", "onSelect": function () { _this.closeNav(); }}, React.createElement("span", {"className": "col-5"}, "Menu"))), React.createElement("li", {"className": "hamburger"}, React.createElement(Nav.NavigationItem, {"hash": "#diagrams", "onSelect": function () { _this.closeNav(); }}, React.createElement("span", {"className": "col-5"}, "Diagrams"))), React.createElement("li", {"className": "hamburger"}, React.createElement(Nav.NavigationItem, {"hash": "#kitchen", "onSelect": function () { _this.closeNav(); }}, React.createElement("span", {"className": "col-5"}, "Kitchen"))), React.createElement("li", {"className": "hamburger status"}, "Server: ", this.state.syncSocketStatus))), React.createElement("div", {"className": 'navigation-view'}, view)));
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