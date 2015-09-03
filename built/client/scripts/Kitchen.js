/// <reference path="./typings/tsd.d.ts" />
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", 'react/addons', './BaseViews', './Utils'], function (require, exports, React, Base, Utils) {
    var KitchenOrdersView = (function (_super) {
        __extends(KitchenOrdersView, _super);
        function KitchenOrdersView(props) {
            _super.call(this, props);
            this.state = { showCleared: false };
        }
        KitchenOrdersView.prototype.handleCompleted = function () {
            React.findDOMNode(this.refs['orderCompletedSound'])['play']();
        };
        KitchenOrdersView.prototype.clearCompleted = function () {
            if (confirm('Are you sure you want to clear all completed orders?')) {
                var ordersArray = Utils.toArray(this.props.orders);
                ordersArray.forEach(function (order) {
                    if (order.completedAt && !order.clearedAt) {
                        order.set('clearedAt', new Date().toISOString());
                    }
                });
            }
        };
        KitchenOrdersView.prototype.render = function () {
            var _this = this;
            function compareKeyMilli(a, b) {
                var a_milli = moment(a.key).valueOf();
                var b_milli = moment(b.key).valueOf();
                if (a_milli < b_milli)
                    return -1;
                if (a_milli > b_milli)
                    return 1;
                return 0;
            }
            var ordersArray = Utils.toArray(this.props.orders);
            if (!this.state.showCleared) {
                var ordersArray = ordersArray.filter(function (order) {
                    return !order.clearedAt;
                });
            }
            var nodes = ordersArray.sort(compareKeyMilli).map(function (order) {
                return (React.createElement(KitchenOrderDetailsView, {"key": order.key, "order": order, "onCompleted": _this.handleCompleted.bind(_this)}));
            });
            var clearCompletedStyle = {
                float: 'right'
            };
            return (React.createElement("div", null, React.createElement("audio", {"ref": "orderCompletedSound", "src": "/content/audio/tada.mp3", "preload": "auto"}), React.createElement("div", null, React.createElement("button", {"style": clearCompletedStyle, "onClick": function () { _this.setState({ showCleared: !_this.state.showCleared }); }}, this.state.showCleared ? 'HIDE CLEARED ORDERS' : 'Show Cleared Orders'), React.createElement("button", {"style": clearCompletedStyle, "onClick": this.clearCompleted.bind(this)}, "Clear Completed Orders"), React.createElement("h2", null, "Kitchen Orders")), nodes));
        };
        return KitchenOrdersView;
    })(Base.SyncView);
    exports.KitchenOrdersView = KitchenOrdersView;
    var KitchenOrderDetailsView = (function (_super) {
        __extends(KitchenOrderDetailsView, _super);
        function KitchenOrderDetailsView(props) {
            _super.call(this, props);
            this.state = {
                isNew: true,
                isComplete: this.props.order.completedAt ? true : false,
                isCleared: this.props.order.clearedAt ? true : false,
                timeElapsed: this.formatElapsedTime()
            };
        }
        KitchenOrderDetailsView.prototype.elapsedDuration = function () {
            var start = moment(this.props.order.key);
            var end = this.state.isComplete ? moment(this.props.order.completedAt) : moment();
            var diff = end.diff(start, 'seconds');
            var duration = moment.duration(diff, 'seconds');
            return duration;
        };
        KitchenOrderDetailsView.prototype.formatElapsedTime = function () {
            var duration = this.elapsedDuration();
            var formatted = duration.minutes() + ':' + ('0' + duration.seconds()).slice(-2);
            return formatted;
        };
        KitchenOrderDetailsView.prototype.tick = function () {
            this.setState({ timeElapsed: this.formatElapsedTime() });
        };
        KitchenOrderDetailsView.prototype.componentDidMount = function () {
            if (!this.state.isComplete) {
                this.interval = setInterval(this.tick.bind(this), 1000);
            }
        };
        KitchenOrderDetailsView.prototype.componentWillUnmount = function () {
            clearInterval(this.interval);
        };
        KitchenOrderDetailsView.prototype.complete = function (e) {
            if (!this.state.isComplete) {
                this.props.order.set('completedAt', new Date().toISOString());
                this.setState({ isComplete: true });
                clearInterval(this.interval);
                this.props.onCompleted();
                e.preventDefault();
            }
        };
        KitchenOrderDetailsView.prototype.render = function () {
            var me = this;
            function compareMilli(a, b) {
                var a_milli = moment(a.key).valueOf();
                var b_milli = moment(b.key).valueOf();
                if (a_milli < b_milli)
                    return -1;
                if (a_milli > b_milli)
                    return 1;
                return 0;
            }
            var itemsArray = Utils.toArray(this.props.order.items);
            var nodes = itemsArray.sort(compareMilli).map(function (item) {
                return (React.createElement(KitchenOrderItemView, {"key": item.key, "item": item}));
            });
            var backgroundColor;
            var bucket = Math.floor(moment(this.props.order.key).minutes() / 10);
            if (bucket == 0) {
                backgroundColor = '#D1C4E9';
            }
            else if (bucket == 1) {
                backgroundColor = '#C8E6C9';
            }
            else if (bucket == 2) {
                backgroundColor = '#B2DFDB';
            }
            else if (bucket == 3) {
                backgroundColor = '#F0F4C3';
            }
            else if (bucket == 4) {
                backgroundColor = '#BBDEFB';
            }
            else if (bucket == 5) {
                backgroundColor = '#FFE0B2';
            }
            else {
                backgroundColor = '';
            }
            var style = {
                backgroundColor: backgroundColor
            };
            var duration = this.elapsedDuration();
            var targetTime = moment.duration(25, 'minutes');
            var progress = duration.asSeconds() / targetTime.asSeconds();
            var late = false;
            if (progress > 1) {
                late = true;
                progress = 1;
            }
            var progressColor;
            if (!late) {
                progressColor = '#00FF00';
            }
            else {
                if (!this.state.isComplete) {
                    progressColor = duration.asSeconds() % 2 ? '#FFCDD2' : '#F44336';
                }
                else {
                    progressColor = '#AB1409';
                }
            }
            var progressStyle = {
                position: 'absolute',
                zIndex: 0,
                top: 0,
                left: 0,
                height: 50,
                width: progress * 100 + '%',
                backgroundColor: progressColor
            };
            var isTogo = this.props.order.isTogo === true || this.props.order.isTogo === 'true';
            var togoStyle = {
                display: isTogo ? 'block' : 'none'
            };
            var completeButtonStyle = {
                backgroundColor: this.state.isComplete ? '#777777' : '#FFFFFF',
                color: this.state.isComplete ? '#FFFFFFF' : '#000000'
            };
            var disableStyle = {
                backgroundColor: "#000000",
                opacity: 0.5,
                width: '100%',
                height: '100%',
                position: 'absolute',
                zIndex: 2,
                top: 0,
                left: 0,
                display: this.state.isComplete ? 'block' : 'none'
            };
            if (this.state.isCleared) {
                disableStyle['boxShadow'] = '0px 0px 10px 5px #0000AA';
            }
            var kitchenOrderStyle = {
                backgroundColor: this.state.isComplete ? '#DDDDDD' : '#FFFFFF',
            };
            return (React.createElement("div", {"className": "kitchenOrder", "style": kitchenOrderStyle}, React.createElement("div", {"style": disableStyle}), React.createElement("div", {"style": progressStyle}), React.createElement("div", {"className": "orderTime"}, moment(this.props.order.key).format('h:mma')), React.createElement("div", {"className": "elapsedTime"}, this.state.timeElapsed), React.createElement("div", {"className": "kitchenOrderName"}, this.props.order.name), React.createElement("div", {"className": "togo", "style": togoStyle}, "**TO GO**"), React.createElement("div", {"className": "kitchenOrderItems", "style": style}, nodes), React.createElement("div", {"className": "kitchenOrderCompleteButton", "style": completeButtonStyle, "onClick": this.complete.bind(this)}, "Complete")));
        };
        return KitchenOrderDetailsView;
    })(Base.SyncView);
    exports.KitchenOrderDetailsView = KitchenOrderDetailsView;
    var KitchenOrderItemView = (function (_super) {
        __extends(KitchenOrderItemView, _super);
        function KitchenOrderItemView() {
            _super.apply(this, arguments);
        }
        KitchenOrderItemView.prototype.render = function () {
            function compareSortOrder(a, b) {
                if (a.key < b.key)
                    return -1;
                if (a.key > b.key)
                    return 1;
                return 0;
            }
            var optionsArray = Utils.toArray(this.props.item.options);
            var nodes = optionsArray.sort(compareSortOrder).map(function (option) {
                return (React.createElement(KitchenOrderItemOptionView, {"key": option.key, "option": option}));
            });
            var noteLines = this.props.item.note != null ? this.props.item.note.match(/[^\r\n]+/g) : [];
            var noteNodes = [];
            if (noteLines != null) {
                var noteNodeCount = 0;
                noteNodes = noteLines.map(function (line) {
                    var noteStyle = {
                        color: 'black'
                    };
                    var lower = line.trim().toLowerCase();
                    if (lower.indexOf('add') == 0) {
                        noteStyle.color = '#00AA00';
                    }
                    else if (lower.indexOf('no') == 0) {
                        noteStyle.color = '#AA0000';
                    }
                    return (React.createElement("div", {"key": noteNodeCount++, "className": "kitchenOrderItemNote", "style": noteStyle}, line));
                });
            }
            ;
            return (React.createElement("div", {"className": "kitchenOrderItem"}, React.createElement("div", {"className": "kitchenOrderItemDescription"}, this.props.item.description), nodes, noteNodes));
        };
        return KitchenOrderItemView;
    })(Base.SyncView);
    exports.KitchenOrderItemView = KitchenOrderItemView;
    var KitchenOrderItemOptionView = (function (_super) {
        __extends(KitchenOrderItemOptionView, _super);
        function KitchenOrderItemOptionView() {
            _super.apply(this, arguments);
        }
        KitchenOrderItemOptionView.prototype.render = function () {
            var color;
            ;
            var textDecoration = 'none';
            switch (this.props.option.type) {
                case 'Remove':
                    color = '#AA0000';
                    textDecoration = 'line-through';
                    break;
                case 'Add':
                    color = '#00AA00';
                    break;
                case 'Option':
                    color = '#0000AA';
                    break;
                default:
                    color = 'rgba(0,0,0,0.87)';
            }
            var style = {
                color: color,
                textDecoration: textDecoration
            };
            return (React.createElement("div", {"className": "kitchenOrderItemOptionDescription", "style": style}, this.props.option.description));
        };
        return KitchenOrderItemOptionView;
    })(Base.SyncView);
    exports.KitchenOrderItemOptionView = KitchenOrderItemOptionView;
});
//# sourceMappingURL=Kitchen.js.map