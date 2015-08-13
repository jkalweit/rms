/// <reference path="../typings/tsd.d.ts" />
/// <reference path="./Models.ts" />

import React = require('react/addons');
import $ = require('jquery');
import io = require('socket.io');
import moment = require('moment');
import models = require('Models');

import baseViews = require('./BaseViews');





export class KitchenOrdersView extends baseViews.BaseView<models.VendorModel, any, any> {
    constructor(props) {
        super(props, models.KitchenOrderModel.collectionName);
        this.state.isDisabled = true;
        this.subscribe('inserted', (data: any) => {
            React.findDOMNode(this.refs['newOrderSound'])['play']();
        });
    }
    handleComplete(entity) {
        entity.completedAt = (new Date()).toISOString();
        React.findDOMNode(this.refs['orderCompletedSound'])['play']();
        this.update(entity);
    }
    handleAcknowledge(entity) {
        entity.acknowledgedAt = (new Date()).toISOString();
        this.update(entity);
    }
    render() {
        var nodes = this.state.data.map(function(entity) {
            return (
                <KitchenOrderDetailsView key={entity._id} entity={entity} onAcknowledge={this.handleAcknowledge.bind(this) } onComplete={this.handleComplete.bind(this) }></KitchenOrderDetailsView>
            );
        }.bind(this));

        var style = {
            display: this.state.isDisabled ? 'none' : 'block'
        };

        return (
            <div>
              <audio ref="newOrderSound" src="/content/audio/bell.mp3" preload="auto"></audio>
              <audio ref="orderCompletedSound" src="/content/audio/tada.mp3" preload="auto"></audio>
              <div onClick={ this.toggleIsDisabled.bind(this) }>
                <h2>Kitchen Orders</h2>
              </div>
              <div style={style}>
                {nodes}
              </div>
            </div>
        );
    }
}



export class KitchenOrderDetailsViewProps extends baseViews.BaseViewProps {
    public onComplete: any;
    public onAcknowledge: any;
}

export class KitchenOrderDetailsView extends baseViews.BaseItemView<any, any> {
    private interval;
    constructor(props) {
        super(props);
        this.state = {
            isNew: true,
            isAcknowledged: this.props.entity.acknowledgedAt ? true : false,
            isComplete: this.props.entity.completedAt ? true : false
        };
        this.state.timeElapsed = this.formatElapsedTime();
    }
    elapsedDuration() {
        var start = moment(this.props.entity.created);
        var end = this.state.isComplete ? moment(this.props.entity.completedAt) : moment();
        var diff = end.diff(start, 'seconds');
        var duration = moment.duration(diff, 'seconds');
        return duration;
    }
    formatElapsedTime() {
        var duration = this.elapsedDuration();
        var formatted = duration.minutes() + ':' + ('0' + duration.seconds()).slice(-2);
        return formatted;
    }
    tick() {
        this.setState({ timeElapsed: this.formatElapsedTime() });
    }
    componentDidMount() {
        if (!this.state.isComplete) {
            this.interval = setInterval(this.tick.bind(this), 1000);
        }
    }
    componentWillUnmount() {
        clearInterval(this.interval);
    }
    complete(e) {
        // prevents completing again before GUI update.
        if (this.state.isAcknowledged && !this.state.isComplete) {
            this.props.onComplete(this.props.entity);
            this.setState({ isComplete: true });
            clearInterval(this.interval);
            e.preventDefault();
        }
    }
    acknowledge(e) {
        // prevents acknowledging again before GUI update.
        if (!this.state.isAcknowledged) {
            this.props.onAcknowledge(this.props.entity);
            this.setState({ isAcknowledged: true });
            e.preventDefault();
        }
    }
    render() {
        var me = this;
        function compareMilli(a, b) {
            var a_milli = moment(a.addedToOrderAt).valueOf();
            var b_milli = moment(b.addedToOrderAt).valueOf();
            if (a_milli < b_milli) return -1;
            if (a_milli > b_milli) return 1;
            return 0;
        }

        var nodes = this.props.entity.kitchenOrderItems.sort(compareMilli).map(function(entity) {
            return (
                <KitchenOrderItemView key={entity.addedToOrderAt} entity={entity} />
            );
        });
        var backgroundColor;
        var bucket = Math.floor(moment(this.props.entity.created).minutes() / 10);
        if (bucket == 0) { backgroundColor = '#D1C4E9'; }
        else if (bucket == 1) { backgroundColor = '#C8E6C9'; }
        else if (bucket == 2) { backgroundColor = '#B2DFDB'; }
        else if (bucket == 3) { backgroundColor = '#F0F4C3'; }
        else if (bucket == 4) { backgroundColor = '#BBDEFB'; }
        else if (bucket == 5) { backgroundColor = '#FFE0B2'; }
        else { backgroundColor = ''; }

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
            } else {
                progressColor = '#00FF00';
            }
        } else {
            if (!this.state.isComplete) {
                progressColor = duration.asSeconds() % 2 ? '#FFCDD2' : '#F44336'
            } else {
                progressColor = '#AB1409'
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
        }

        var completeButtonStyle = {
            backgroundColor: this.state.isComplete ? '#777777' : '#FFFFFF',
            color: this.state.isComplete ? '#FFFFFFF' : '#000000'
        }

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

        return (
            <div className="kitchenOrder" style={kitchenOrderStyle} onClick={this.acknowledge.bind(this) }>
              <div style={disableStyle}></div>
              <div style={progressStyle}></div>
              <div className="orderTime">{ moment(this.props.entity.created).format('h:mma') }</div>
              <div className="elapsedTime">{ this.state.timeElapsed }</div>
              {/* <div className="location">{ this.props.entity.location }</div> */}
              <div className="kitchenOrderName">{ this.props.entity.name }</div>
              <div className="togo" style={togoStyle}>**TO GO**</div>
              <div className="kitchenOrderItems" style={style}>
                {  nodes  }
              </div>
              <div className="kitchenOrderCompleteButton" style={completeButtonStyle} onClick={this.complete.bind(this) }>Complete</div>
            </div>
        );
    }
}

export class KitchenOrderItemView extends baseViews.BaseItemView<any, any> {
    render() {
        var me = this;

        function compareSortOrder(a, b) {
            if (a.sortOrder < b.sortOrder) return -1;
            if (a.sortOrder > b.sortOrder) return 1;
            return 0;
        }

        var nodes = this.props.entity.kitchenOrderItemOptions.sort(compareSortOrder).map(function(entity) {
            return (
                <KitchenOrderItemOptionView key={entity.sortOrder} entity={entity} />
            );
        });

        var noteLines = this.props.entity.note != null ? this.props.entity.note.match(/[^\r\n]+/g) : [];

        var noteNodes = [];

        if (noteLines != null) {

            noteNodes = noteLines.map(function(line) {

                var noteStyle = {
                    color: 'black'
                };

                var lower = line.trim().toLowerCase();

                if (lower.indexOf('add') == 0) {
                    noteStyle.color = '#00AA00';
                } else if (lower.indexOf('no') == 0) {
                    noteStyle.color = '#AA0000';
                }

                return (
                    <div className="kitchenOrderItemNote" style={ noteStyle }>{ line }</div>
                );
            });
        };

        var icon = this.props.entity.prepType ? '/content/icons/' + this.props.entity.prepType.toLowerCase() + '.png' : '';

        return (
            <div className="kitchenOrderItem">
        <div className="kitchenOrderItemDescription"><img src={icon} />{ this.props.entity.description }</div>
        {nodes}
        {noteNodes}
            </div>
        );
    }
}

export class KitchenOrderItemOptionView extends baseViews.BaseItemView<any, any> {
    render() {
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
        return (
            <div className="kitchenOrderItemOptionDescription" style={style}><img src={icon} />{ this.props.entity.description }</div>
        );
    }
}
