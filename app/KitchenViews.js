/// <reference path="../typings/tsd.d.ts" />
/// <reference path="./Models.ts" />
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", 'react/addons', 'moment', 'Models', './BaseViews'], function (require, exports, React, moment, models, baseViews) {
    var KitchenOrdersView = (function (_super) {
        __extends(KitchenOrdersView, _super);
        function KitchenOrdersView(props) {
            var _this = this;
            _super.call(this, props, models.KitchenOrderModel.collectionName);
            this.state.isDisabled = true;
            this.subscribe('inserted', function (data) {
                React.findDOMNode(_this.refs['newOrderSound'])['play']();
            });
        }
        KitchenOrdersView.prototype.handleComplete = function (entity) {
            entity.completedAt = (new Date()).toISOString();
            React.findDOMNode(this.refs['orderCompletedSound'])['play']();
            this.update(entity);
        };
        KitchenOrdersView.prototype.handleAcknowledge = function (entity) {
            entity.acknowledgedAt = (new Date()).toISOString();
            this.update(entity);
        };
        KitchenOrdersView.prototype.render = function () {
            var nodes = this.state.data.map(function (entity) {
                return (React.createElement(KitchenOrderDetailsView, {"key": entity._id, "entity": entity, "onAcknowledge": this.handleAcknowledge.bind(this), "onComplete": this.handleComplete.bind(this)}));
            }.bind(this));
            var style = {
                display: this.state.isDisabled ? 'none' : 'block'
            };
            return (React.createElement("div", null, React.createElement("audio", {"ref": "newOrderSound", "src": "/content/audio/bell.mp3", "preload": "auto"}), React.createElement("audio", {"ref": "orderCompletedSound", "src": "/content/audio/tada.mp3", "preload": "auto"}), React.createElement("div", {"onClick": this.toggleIsDisabled.bind(this)}, React.createElement("h2", null, "Kitchen Orders")), React.createElement("div", {"style": style}, nodes)));
        };
        return KitchenOrdersView;
    })(baseViews.BaseView);
    exports.KitchenOrdersView = KitchenOrdersView;
    var KitchenOrderDetailsViewProps = (function (_super) {
        __extends(KitchenOrderDetailsViewProps, _super);
        function KitchenOrderDetailsViewProps() {
            _super.apply(this, arguments);
        }
        return KitchenOrderDetailsViewProps;
    })(baseViews.BaseViewProps);
    exports.KitchenOrderDetailsViewProps = KitchenOrderDetailsViewProps;
    var KitchenOrderDetailsView = (function (_super) {
        __extends(KitchenOrderDetailsView, _super);
        function KitchenOrderDetailsView(props) {
            _super.call(this, props);
            this.state = {
                isNew: true,
                isAcknowledged: this.props.entity.acknowledgedAt ? true : false,
                isComplete: this.props.entity.completedAt ? true : false
            };
            this.state.timeElapsed = this.formatElapsedTime();
        }
        KitchenOrderDetailsView.prototype.elapsedDuration = function () {
            var start = moment(this.props.entity.created);
            var end = this.state.isComplete ? moment(this.props.entity.completedAt) : moment();
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
            if (this.state.isAcknowledged && !this.state.isComplete) {
                this.props.onComplete(this.props.entity);
                this.setState({ isComplete: true });
                clearInterval(this.interval);
                e.preventDefault();
            }
        };
        KitchenOrderDetailsView.prototype.acknowledge = function (e) {
            if (!this.state.isAcknowledged) {
                this.props.onAcknowledge(this.props.entity);
                this.setState({ isAcknowledged: true });
                e.preventDefault();
            }
        };
        KitchenOrderDetailsView.prototype.render = function () {
            var me = this;
            function compareMilli(a, b) {
                var a_milli = moment(a.addedToOrderAt).valueOf();
                var b_milli = moment(b.addedToOrderAt).valueOf();
                if (a_milli < b_milli)
                    return -1;
                if (a_milli > b_milli)
                    return 1;
                return 0;
            }
            var nodes = this.props.entity.kitchenOrderItems.sort(compareMilli).map(function (entity) {
                return (React.createElement(KitchenOrderItemView, {"key": entity.addedToOrderAt, "entity": entity}));
            });
            var backgroundColor;
            var bucket = Math.floor(moment(this.props.entity.created).minutes() / 10);
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
            if (!this.props.entity.acknowledgedAt) {
                backgroundColor = 'blue';
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
                if (!this.state.isAcknowledged) {
                    progressColor = 'blue';
                }
                else {
                    progressColor = '#00FF00';
                }
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
            var isTogo = this.props.entity.isTogo === true || this.props.entity.isTogo === 'true';
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
            var kitchenOrderStyle = {
                backgroundColor: this.state.isComplete ? '#DDDDDD' : '#FFFFFF',
            };
            return (React.createElement("div", {"className": "kitchenOrder", "style": kitchenOrderStyle, "onClick": this.acknowledge.bind(this)}, React.createElement("div", {"style": disableStyle}), React.createElement("div", {"style": progressStyle}), React.createElement("div", {"className": "orderTime"}, moment(this.props.entity.created).format('h:mma')), React.createElement("div", {"className": "elapsedTime"}, this.state.timeElapsed), React.createElement("div", {"className": "kitchenOrderName"}, this.props.entity.name), React.createElement("div", {"className": "togo", "style": togoStyle}, "**TO GO**"), React.createElement("div", {"className": "kitchenOrderItems", "style": style}, nodes), React.createElement("div", {"className": "kitchenOrderCompleteButton", "style": completeButtonStyle, "onClick": this.complete.bind(this)}, "Complete")));
        };
        return KitchenOrderDetailsView;
    })(baseViews.BaseItemView);
    exports.KitchenOrderDetailsView = KitchenOrderDetailsView;
    var KitchenOrderItemView = (function (_super) {
        __extends(KitchenOrderItemView, _super);
        function KitchenOrderItemView() {
            _super.apply(this, arguments);
        }
        KitchenOrderItemView.prototype.render = function () {
            var me = this;
            function compareSortOrder(a, b) {
                if (a.sortOrder < b.sortOrder)
                    return -1;
                if (a.sortOrder > b.sortOrder)
                    return 1;
                return 0;
            }
            var nodes = this.props.entity.kitchenOrderItemOptions.sort(compareSortOrder).map(function (entity) {
                return (React.createElement(KitchenOrderItemOptionView, {"key": entity.sortOrder, "entity": entity}));
            });
            var noteLines = this.props.entity.note != null ? this.props.entity.note.match(/[^\r\n]+/g) : [];
            var noteNodes = [];
            if (noteLines != null) {
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
                    return (React.createElement("div", {"className": "kitchenOrderItemNote", "style": noteStyle}, line));
                });
            }
            ;
            var icon = this.props.entity.prepType ? '/content/icons/' + this.props.entity.prepType.toLowerCase() + '.png' : '';
            return (React.createElement("div", {"className": "kitchenOrderItem"}, React.createElement("div", {"className": "kitchenOrderItemDescription"}, React.createElement("img", {"src": icon}), this.props.entity.description), nodes, noteNodes));
        };
        return KitchenOrderItemView;
    })(baseViews.BaseItemView);
    exports.KitchenOrderItemView = KitchenOrderItemView;
    var KitchenOrderItemOptionView = (function (_super) {
        __extends(KitchenOrderItemOptionView, _super);
        function KitchenOrderItemOptionView() {
            _super.apply(this, arguments);
        }
        KitchenOrderItemOptionView.prototype.render = function () {
            var me = this;
            var color;
            var textDecoration = 'none';
            switch (this.props.entity.type) {
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
            var icon = this.props.entity.prepType ? '/content/icons/' + this.props.entity.prepType.toLowerCase() + '.png' : '';
            var style = {
                color: color,
                textDecoration: textDecoration
            };
            return (React.createElement("div", {"className": "kitchenOrderItemOptionDescription", "style": style}, React.createElement("img", {"src": icon}), this.props.entity.description));
        };
        return KitchenOrderItemOptionView;
    })(baseViews.BaseItemView);
    exports.KitchenOrderItemOptionView = KitchenOrderItemOptionView;
});
//# sourceMappingURL=KitchenViews.js.map