/// <reference path="../typings/tsd.d.ts" />
/// <reference path="./Models.ts" />
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", 'react/addons', './Store', './BaseViews', './MenuViews', './ReconciliationViews'], function (require, exports, React, Store, bv, menuViews, recViews) {
    React.initializeTouchEvents(true);
    var NavigationBase = (function (_super) {
        __extends(NavigationBase, _super);
        function NavigationBase(props) {
            var _this = this;
            _super.call(this, props);
            this.state = { isSelected: this.compareHash() };
            window.addEventListener('hashchange', function () {
                _this.setState({ isSelected: _this.compareHash() });
            });
        }
        NavigationBase.prototype.compareHash = function () {
            var normalizedHash = (location.hash || '').toLowerCase();
            if (normalizedHash == '')
                normalizedHash = '#';
            return normalizedHash == this.props.hash;
        };
        NavigationBase.prototype.render = function () {
            return (React.createElement("div", null, "Navigator Base is an abstract class.You must implement your own render()."));
        };
        return NavigationBase;
    })(bv.FreezerView);
    exports.NavigationBase = NavigationBase;
    var NavigationView = (function (_super) {
        __extends(NavigationView, _super);
        function NavigationView() {
            _super.apply(this, arguments);
        }
        NavigationView.prototype.render = function () {
            var style = {
                zIndex: this.state.isSelected ? 1 : 0,
                opacity: this.state.isSelected ? 1 : 0
            };
            return (React.createElement("div", {"className": "navigation-view", "style": style}, this.props.children));
        };
        return NavigationView;
    })(NavigationBase);
    exports.NavigationView = NavigationView;
    var NavigationItem = (function (_super) {
        __extends(NavigationItem, _super);
        function NavigationItem() {
            _super.apply(this, arguments);
        }
        NavigationItem.prototype.render = function () {
            var _this = this;
            var className = this.state.isSelected ? 'active' : '';
            return (React.createElement("a", {"className": className, "onClick": function () { _this.props.onSelect(_this.props.hash); }, "href": this.props.hash}, this.props.children));
        };
        return NavigationItem;
    })(NavigationView);
    exports.NavigationItem = NavigationItem;
    var MainView = (function (_super) {
        __extends(MainView, _super);
        function MainView(props) {
            _super.call(this, props);
            this.state = {
                reconciliation: Store.reconciliation,
                isNavOpen: false
            };
        }
        MainView.prototype.componentDidMount = function () {
            var _this = this;
            Store.onChanged = function (updated) {
                console.log('Store Changed!');
                console.log(updated);
                _this.setState({
                    reconciliation: updated
                });
            };
        };
        MainView.prototype.closeNav = function () {
            this.setState({ isNavOpen: false });
        };
        MainView.prototype.render = function () {
            var _this = this;
            var rec = this.state.reconciliation;
            var className = this.state.isNavOpen ? 'open' : '';
            return (React.createElement("div", null, React.createElement("div", {"className": "sticky-header"}, React.createElement("ul", {"className": className}, React.createElement("li", {"className": "hamburger-icon", "onClick": function () { _this.setState({ isNavOpen: !_this.state.isNavOpen }); }}, React.createElement("span", {"className": "col-2 fa fa-bars"})), React.createElement("li", null, React.createElement(NavigationItem, {"hash": "#", "onSelect": function () { _this.closeNav(); }}, React.createElement("span", {"className": "col-2"}, "RMS"))), React.createElement("li", {"className": "hamburger"}, React.createElement(NavigationItem, {"hash": "#reconciliation", "onSelect": function () { _this.closeNav(); }}, React.createElement("span", {"className": "col-6"}, "Reconciliation"))), React.createElement("li", {"className": "hamburger"}, React.createElement(NavigationItem, {"hash": "#menu", "onSelect": function () { _this.closeNav(); }}, React.createElement("span", {"className": "col-5"}, "Menu"))), React.createElement("li", {"className": "hamburger"}, React.createElement(NavigationItem, {"hash": "#kitchen", "onSelect": function () { _this.closeNav(); }}, React.createElement("span", {"className": "col-5"}, "Kitchen"))))), React.createElement(NavigationView, {"hash": "#"}, React.createElement("h1", null, "Welcome to RMS"), React.createElement("p", null, "There will be a dashboard here later."), React.createElement("p", null, "Use the navigation above to select a location.")), React.createElement(NavigationView, {"hash": "#reconciliation"}, React.createElement(recViews.ReconciliationView, {"tickets": rec.tickets, "menu": rec.menu})), React.createElement(NavigationView, {"hash": "#menu"}, React.createElement(menuViews.MenuEditView, {"menu": rec.menu})), React.createElement(NavigationView, {"hash": "#kitchen"}, React.createElement("h1", null, "The kitchen!"))));
        };
        return MainView;
    })(React.Component);
    exports.MainView = MainView;
});
//# sourceMappingURL=Views.js.map