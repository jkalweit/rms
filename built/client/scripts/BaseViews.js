/// <reference path="./typings/tsd.d.ts" />
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", 'react/addons'], function (require, exports, React) {
    var SyncView = (function (_super) {
        __extends(SyncView, _super);
        function SyncView(props) {
            _super.call(this, props);
            this.name = 'SynceView';
            this.state = {};
        }
        SyncView.prototype.isShallowDiff = function (curr, next) {
            var equal = true;
            if (curr === null || next === null || typeof curr !== 'object' || typeof next !== 'object') {
                return curr !== next;
            }
            Object.keys(next).forEach(function (key) {
                if (typeof next[key] === 'function') {
                }
                else {
                    equal = equal && curr[key] === next[key];
                }
            });
            return !equal;
        };
        SyncView.prototype.shouldComponentUpdate = function (nextProps, nextState) {
            var propsDiff = this.isShallowDiff(this.props, nextProps);
            var stateDiff = this.isShallowDiff(this.state, nextState);
            var shouldUpdate = propsDiff || stateDiff;
            return shouldUpdate;
        };
        SyncView.prototype.componentWillReceiveProps = function (nextProps, nextState) {
            if (this.shouldComponentUpdate(nextProps, nextState)) {
                this.setState({ isNew: true });
            }
        };
        SyncView.prototype.preRender = function () {
            var _this = this;
            console.log(this.name, 'Render');
            var classNames = ['flash'];
            if (this.state.isNew) {
                classNames.push('glow');
                setTimeout(function () { _this.setState({ isNew: false }); }, 200);
            }
            return classNames;
        };
        return SyncView;
    })(React.Component);
    exports.SyncView = SyncView;
    var SimpleConfirmView = (function (_super) {
        __extends(SimpleConfirmView, _super);
        function SimpleConfirmView() {
            _super.apply(this, arguments);
        }
        SimpleConfirmView.prototype.doCallback = function (name) {
            if (this.props[name])
                this.props[name]();
        };
        SimpleConfirmView.prototype.render = function () {
            var _this = this;
            var hide = { display: this.props.onRemove ? 'block' : 'none' };
            var style = {
                clear: 'both',
                margin: '10px',
                minHeight: '40px',
                position: 'absolute',
                bottom: 0,
                left: 0
            };
            return (React.createElement("div", {"style": style}, React.createElement(Button, {"className": "col-4 btn-confirm", "onClick": function () { _this.doCallback('onSave'); }, "disabled": !this.props.isDirty}, "Save"), React.createElement(Button, {"className": "col-4 btn-cancel", "onClick": function () { _this.doCallback('onCancel'); }}, "Cancel"), React.createElement(Button, {"className": "col-4 btn-delete", "onClick": function () { _this.doCallback('onRemove'); }, "style": hide}, "Delete")));
        };
        return SimpleConfirmView;
    })(React.Component);
    exports.SimpleConfirmView = SimpleConfirmView;
    var Button = (function (_super) {
        __extends(Button, _super);
        function Button(props) {
            _super.call(this, props);
            this.state = {
                isPressed: false
            };
        }
        Button.prototype.handleClick = function (e) {
            var _this = this;
            this.setState({ isPressed: true });
            setTimeout(function () { _this.setState({ isPressed: false }); }, 100);
            if (this.props.onClick)
                this.props.onClick(e);
        };
        Button.prototype.render = function () {
            var _this = this;
            var classes = this.props.className || "";
            classes = 'btn ' + classes + (this.state.isPressed ? ' pressed' : '');
            return (React.createElement("button", {"className": classes, "style": this.props.style, "onClick": function (e) { _this.handleClick(e); }}, this.props.children));
        };
        return Button;
    })(React.Component);
    exports.Button = Button;
});
//# sourceMappingURL=BaseViews.js.map