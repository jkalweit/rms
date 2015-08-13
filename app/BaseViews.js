/// <reference path="../typings/tsd.d.ts" />
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", 'react/addons', './DataStores'], function (require, exports, React, dataStores) {
    var Utils = (function () {
        function Utils() {
        }
        Utils.FormatDollars = function (value, precision) {
            if (precision === void 0) { precision = 2; }
            var val = Number(value);
            return '$' + val.toFixed(2);
        };
        return Utils;
    })();
    exports.Utils = Utils;
    var FreezerView = (function (_super) {
        __extends(FreezerView, _super);
        function FreezerView() {
            _super.apply(this, arguments);
            this.name = 'FreezerView';
        }
        FreezerView.prototype.isShallowDiff = function (curr, next) {
            var equal = true;
            if (curr === null || next === null || typeof curr !== 'object' || typeof next !== 'object') {
                return curr !== next;
            }
            Object.keys(next).forEach(function (key) {
                if (typeof next[key] === 'function') {
                }
                else if ((next[key] !== curr[key])) {
                    equal = false;
                }
            });
            return !equal;
        };
        FreezerView.prototype.shouldComponentUpdate = function (nextProps, nextState) {
            var propsDiff = this.isShallowDiff(this.props, nextProps);
            var stateDiff = this.isShallowDiff(this.state, nextState);
            var shouldUpdate = propsDiff || stateDiff;
            return shouldUpdate;
        };
        return FreezerView;
    })(React.Component);
    exports.FreezerView = FreezerView;
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
    var BaseViewProps = (function () {
        function BaseViewProps() {
        }
        return BaseViewProps;
    })();
    exports.BaseViewProps = BaseViewProps;
    var BaseView = (function (_super) {
        __extends(BaseView, _super);
        function BaseView(props, collectionName) {
            _super.call(this, props);
            this.collectionName = collectionName;
            this.state = {
                data: [],
                isDisabled: false
            };
            this.dataStore = new dataStores.SocketIODataStore(collectionName);
            this.dataStore.on('queryed', this.handleRefresh.bind(this));
            this.dataStore.on('inserted', this.refresh.bind(this));
            this.dataStore.on('updated', this.refresh.bind(this));
            this.dataStore.on('removed', this.refresh.bind(this));
            this.dataStore.init();
        }
        BaseView.prototype.toggleIsDisabled = function () {
            this.setState({ isDisabled: !this.state.isDisabled });
        };
        BaseView.prototype.componentDidMount = function () {
            this.refresh();
        };
        BaseView.prototype.refresh = function () {
            this.dataStore.query();
        };
        BaseView.prototype.handleRefresh = function (data) {
            this.setState({ data: data });
        };
        BaseView.prototype.insertBase = function (item) {
            this.dataStore.insert(item);
        };
        BaseView.prototype.update = function (data) {
            var me = this;
            this.dataStore.update(data);
        };
        BaseView.prototype.remove = function (id) {
            var me = this;
            this.dataStore.remove(id);
        };
        return BaseView;
    })(React.Component);
    exports.BaseView = BaseView;
    var BaseItemView = (function (_super) {
        __extends(BaseItemView, _super);
        function BaseItemView(props) {
            _super.call(this, props);
            this.state = {
                entity: props.entity,
                isDirty: false,
                isDisabled: false
            };
        }
        BaseItemView.prototype.toggleIsDisabled = function () {
            this.setState({ isDisabled: !this.state.isDisabled });
        };
        BaseItemView.prototype.componentWillReceiveProps = function (nextProps) {
            this.setState({
                entity: nextProps.entity,
                isDirty: false
            });
        };
        BaseItemView.prototype.update = function () {
            var me = this;
            this.props.onUpdate(this.state.entity);
        };
        BaseItemView.prototype.remove = function () {
            if (confirm('Delete?')) {
                this.props.onRemove(this.props.entity._id);
            }
        };
        BaseItemView.prototype.handleChange = function (fieldName, event) {
            var newEntity = this.state.entity;
            if (newEntity[fieldName] !== event.target.value) {
                newEntity[fieldName] = event.target.value;
                this.setState({
                    entity: newEntity,
                    isDirty: true
                });
            }
        };
        BaseItemView.prototype.render = function () {
            return (React.createElement("div", null, this.props.children));
        };
        return BaseItemView;
    })(React.Component);
    exports.BaseItemView = BaseItemView;
    var SimpleItemEditView = (function (_super) {
        __extends(SimpleItemEditView, _super);
        function SimpleItemEditView(props) {
            _super.call(this, props);
            var entityCopy = {};
            if (props.entity) {
                entityCopy = JSON.parse(JSON.stringify(props.entity));
            }
            this.state = {
                entity: entityCopy,
                isDirty: false,
                isDisabled: false
            };
        }
        SimpleItemEditView.prototype.toggleIsDisabled = function () {
            this.setState({ isDisabled: !this.state.isDisabled });
        };
        SimpleItemEditView.prototype.componentWillReceiveProps = function (nextProps) {
            var entityCopy = {};
            if (nextProps.entity) {
                entityCopy = JSON.parse(JSON.stringify(nextProps.entity));
            }
            this.setState({
                entity: entityCopy,
                isDirty: false
            });
        };
        SimpleItemEditView.prototype.handleChange = function (fieldName, event) {
            var newEntity = this.state.entity;
            if (newEntity[fieldName] !== event.target.value) {
                newEntity[fieldName] = event.target.value;
                this.setState({
                    entity: newEntity,
                    isDirty: true
                });
            }
        };
        SimpleItemEditView.prototype.reset = function () {
            this.setState({
                entity: JSON.parse(JSON.stringify(this.props.entity)),
                isDirty: false
            });
        };
        SimpleItemEditView.prototype.save = function () {
            this.props.onSave(this.state.entity);
        };
        SimpleItemEditView.prototype.cancel = function () {
            this.props.onCancel();
        };
        SimpleItemEditView.prototype.remove = function () {
            this.props.onRemove();
        };
        SimpleItemEditView.prototype.render = function () {
            return (React.createElement("div", null, this.props.children));
        };
        return SimpleItemEditView;
    })(React.Component);
    exports.SimpleItemEditView = SimpleItemEditView;
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
    var ModalView = (function (_super) {
        __extends(ModalView, _super);
        function ModalView(props, collectionName) {
            _super.call(this, props);
            this.state = {
                isVisible: false
            };
        }
        ModalView.prototype.show = function (callback) {
            var _this = this;
            this.setState({
                isVisible: true
            }, function () {
                if (callback)
                    callback();
                if (_this.props.onShown)
                    _this.props.onShown();
            });
        };
        ModalView.prototype.hide = function () {
            this.setState({
                isVisible: false
            });
        };
        ModalView.prototype.toggle = function () {
            var _this = this;
            this.setState({
                isVisible: !this.state.isVisible
            }, function () {
                if (_this.state.isVisible && _this.props.onShown) {
                    _this.props.onShown();
                }
            });
        };
        ModalView.prototype.render = function () {
            var backdropStyle = {
                display: this.state.isVisible ? 'block' : 'none',
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                zIndex: 10,
                backgroundColor: 'rgba(0,0,0,0.5)'
            };
            var innerStyle = {
                borderRadius: '5px',
                backgroundColor: '#FFFFFF',
                color: '#000000',
                minWidth: '400px',
                maxWidth: '600px',
                width: '80%',
                margin: '20px auto',
                padding: '40px'
            };
            return (React.createElement("div", {"style": backdropStyle}, React.createElement("div", {"style": innerStyle}, this.props.children)));
        };
        return ModalView;
    })(React.Component);
    exports.ModalView = ModalView;
});
//# sourceMappingURL=BaseViews.js.map