/// <reference path="./typings/tsd.d.ts" />

import React = require('react/addons');
import Sync = require('./SyncNode');
import SyncSocket = require('./SyncNodeSocket');
import Base = require('./BaseViews');
import Utils = require('./Utils');
import Models = require('./Models');



export interface KitchenOrdersViewProps {
    orders: { [key: string]: Models.KitchenOrder };
}
export interface KitchenOrdersViewState {
    showCleared: boolean;
}
export class KitchenOrdersView extends Base.SyncView<KitchenOrdersViewProps, KitchenOrdersViewState> {
    constructor(props: KitchenOrdersViewProps) {
        super(props);
        this.state = { showCleared: false };
        // this.state.isDisabled = true;
        // this.subscribe('inserted', (data: any) => {
        //     React.findDOMNode(this.refs['newOrderSound'])['play']();
        // });
    }
    handleCompleted() {
        React.findDOMNode(this.refs['orderCompletedSound'])['play']();
    }
    // handleAcknowledge(entity) {
    //     entity.acknowledgedAt = (new Date()).toISOString();
    //     this.update(entity);
    // }
    clearCompleted() {
        if (confirm('Are you sure you want to clear all completed orders?')) {
            var ordersArray = Utils.toArray(this.props.orders);
            ordersArray.forEach(order => {
                if (order.completedAt && !order.clearedAt) {
                    (order as Sync.ISyncNode).set('clearedAt', new Date().toISOString());
                }
            });
        }
    }
    render() {
        function compareKeyMilli(a: Models.KitchenOrder, b: Models.KitchenOrder) {
            var a_milli = moment(a.key).valueOf();
            var b_milli = moment(b.key).valueOf();
            if (a_milli < b_milli) return -1;
            if (a_milli > b_milli) return 1;
            return 0;
        }

        var ordersArray = Utils.toArray(this.props.orders);

        if(!this.state.showCleared) {
          var ordersArray = ordersArray.filter((order: Models.KitchenOrder) => {
            return !order.clearedAt;
          });
        }

        var nodes = ordersArray.sort(compareKeyMilli).map((order: Models.KitchenOrder) => {
            return (
                <KitchenOrderDetailsView key={order.key} order={order} onCompleted={this.handleCompleted.bind(this) }></KitchenOrderDetailsView>
            );
        });

        var clearCompletedStyle = {
            float: 'right'
        };

        return (
            <div>
              <audio ref="orderCompletedSound" src="/content/audio/tada.mp3" preload="auto"></audio>
              <div>
                <button style={clearCompletedStyle} onClick={() => { this.setState({ showCleared: !this.state.showCleared }); }}>{ this.state.showCleared ? 'HIDE CLEARED ORDERS' : 'Show Cleared Orders' }</button>
                <button style={clearCompletedStyle} onClick={this.clearCompleted.bind(this) }>Clear Completed Orders</button>
                <h2>Kitchen Orders</h2>
              </div>
              {nodes}
            </div>
        );
    }
}




export interface KitchenOrderDetailsViewProps {
    key: string;
    order: Models.KitchenOrder;
    onCompleted: () => void;
}
export interface KitchenOrderDetailsViewState {
    timeElapsed?: string;
}
export interface KitchenOrderDetailsViewState {
    isNew?: boolean;
    isComplete?: boolean;
    isCleared?: boolean;
}
export class KitchenOrderDetailsView extends Base.SyncView<KitchenOrderDetailsViewProps, KitchenOrderDetailsViewState> {
    private interval: number;
    constructor(props: KitchenOrderDetailsViewProps) {
        super(props);
        this.state = {
            isNew: true,
            isComplete: this.props.order.completedAt ? true : false,
            isCleared: this.props.order.clearedAt ? true : false,
            timeElapsed: this.formatElapsedTime()
        };
    }
    elapsedDuration() {
        var start = moment(this.props.order.key);
        var end = this.state.isComplete ? moment(this.props.order.completedAt) : moment();
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
    complete(e: Event) {
        // prevents completing again before GUI update.
        if (!this.state.isComplete) {
            (this.props.order as Sync.ISyncNode).set('completedAt', new Date().toISOString());
            // this.props.onComplete(this.props.entity);
            this.setState({ isComplete: true });
            clearInterval(this.interval);
            this.props.onCompleted();
            e.preventDefault();
        }
    }
    render() {
        var me = this;
        function compareMilli(a: Models.KitchenOrderItem, b: Models.KitchenOrderItem) {
            var a_milli = moment(a.key).valueOf();
            var b_milli = moment(b.key).valueOf();
            if (a_milli < b_milli) return -1;
            if (a_milli > b_milli) return 1;
            return 0;
        }

        var itemsArray = Utils.toArray(this.props.order.items);
        var nodes = itemsArray.sort(compareMilli).map((item: Models.KitchenOrderItem) => {
            return (
                <KitchenOrderItemView key={item.key} item={item} />
            );
        });
        var backgroundColor: string;
        var bucket = Math.floor(moment(this.props.order.key).minutes() / 10);
        if (bucket == 0) { backgroundColor = '#D1C4E9'; }
        else if (bucket == 1) { backgroundColor = '#C8E6C9'; }
        else if (bucket == 2) { backgroundColor = '#B2DFDB'; }
        else if (bucket == 3) { backgroundColor = '#F0F4C3'; }
        else if (bucket == 4) { backgroundColor = '#BBDEFB'; }
        else if (bucket == 5) { backgroundColor = '#FFE0B2'; }
        else { backgroundColor = ''; }

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

        var progressColor: string;
        if (!late) {
            progressColor = '#00FF00';
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

        var isTogo = this.props.order.isTogo === true || this.props.order.isTogo as any === 'true';
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
        if(this.state.isCleared) {
          disableStyle['boxShadow'] = '0px 0px 10px 5px #0000AA';
        }

        var kitchenOrderStyle = {
            backgroundColor: this.state.isComplete ? '#DDDDDD' : '#FFFFFF',
        };

        return (
            <div className="kitchenOrder" style={kitchenOrderStyle}>
              <div style={disableStyle}></div>
              <div style={progressStyle}></div>
              <div className="orderTime">{ moment(this.props.order.key).format('h:mma') }</div>
              <div className="elapsedTime">{ this.state.timeElapsed }</div>
              {/* <div className="location">{ this.props.entity.location }</div> */}
              <div className="kitchenOrderName">{ this.props.order.name }</div>
              <div className="togo" style={togoStyle}>**TO GO**</div>
              <div className="kitchenOrderItems" style={style}>
                { nodes  }
              </div>
              <div className="kitchenOrderCompleteButton" style={completeButtonStyle} onClick={this.complete.bind(this) }>Complete</div>
            </div>
        );
    }
}


export interface KitchenOrderItemViewProps {
    key?: string;
    item?: Models.KitchenOrderItem;
}
export class KitchenOrderItemView extends Base.SyncView<KitchenOrderItemViewProps, {}> {
    render() {
        function compareSortOrder(a: Models.KitchenOrderItemOption, b: Models.KitchenOrderItemOption) {
            if (a.key < b.key) return -1;
            if (a.key > b.key) return 1;
            return 0;
        }

        var optionsArray = Utils.toArray(this.props.item.options);
        var nodes = optionsArray.sort(compareSortOrder).map((option: Models.KitchenOrderItemOption) => {
            return (
                <KitchenOrderItemOptionView key={option.key} option={option} />
            );
        });

        var noteLines: string[] = this.props.item.note != null ? this.props.item.note.match(/[^\r\n]+/g) : [];

        var noteNodes: any[] = [];

        if (noteLines != null) {
            var noteNodeCount = 0;
            noteNodes = noteLines.map((line: string) => {

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
                    <div key={noteNodeCount++} className="kitchenOrderItemNote" style={ noteStyle }>{ line }</div>
                );
            });
        };

        //var icon = this.props.item.prepType ? '/content/icons/' + this.props.item.prepType.toLowerCase() + '.png' : '';

        return (
            <div className="kitchenOrderItem">
        <div className="kitchenOrderItemDescription">{ this.props.item.description }</div>
        {nodes}
        {noteNodes}
            </div>
        );
    }
}

export interface KitchenOrderItemOptionProps {
    key?: string;
    option?: Models.KitchenOrderItemOption;
}
export class KitchenOrderItemOptionView extends Base.SyncView<KitchenOrderItemOptionProps, any> {
    render() {
        var color: string;;
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
        //var icon = this.props.option.prepType ? '/content/icons/' + this.props.option.prepType.toLowerCase() + '.png' : '';

        var style = {
            color: color,
            textDecoration: textDecoration
        };
        return (
            <div className="kitchenOrderItemOptionDescription" style={style}>{ this.props.option.description }</div>
        );
    }
}
