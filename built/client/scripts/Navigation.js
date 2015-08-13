/// <reference path="./typings/tsd.d.ts" />
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", 'react/addons'], function (require, exports, React) {
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
    })(React.Component);
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
});
//# sourceMappingURL=Navigation.js.map