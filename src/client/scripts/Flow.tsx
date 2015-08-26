/// <reference path="./typings/tsd.d.ts" />

import React = require('react/addons');
import Sync = require('./SyncNode');
import SyncSocket = require('./SyncNodeSocket');
import Base = require('./BaseViews');
import Utils = require('./Utils');
import Models = require('./Models');





export interface FlowDiagramsProps {
}
export interface FlowDiagramsState extends Base.SyncViewState {
    syncSocketStatus?: string;
    diagrams?: Models.FlowDiagrams;
    selectedDiagram?: Models.FlowDiagram;
}
export class FlowDiagrams extends Base.SyncView<FlowDiagramsProps, FlowDiagramsState> {
    sync: SyncSocket.SyncNodeSocket<Models.FlowDiagrams>;
    constructor(props: FlowDiagramsProps) {
        super(props);
        var defaultDiagrams: Models.FlowDiagrams;
        defaultDiagrams = {
            diagrams: {
                '0': {
                    key: '0',
                    name: 'New Diagram',
                    items: {
                    }
                }
            }
        };

        this.sync = new SyncSocket.SyncNodeSocket<Models.FlowDiagrams>('/flowdiagrams', defaultDiagrams);
        this.sync.onStatusChanged = (path: string, status: string) => {
            this.setState({ syncSocketStatus: status });
        };

        this.sync.onUpdated((updated: Models.FlowDiagrams) => {
            console.log('updated!', updated);
            var selectedDiagram = this.state.selectedDiagram;
            if (selectedDiagram) selectedDiagram = updated.diagrams[selectedDiagram.key];
            this.setState({ diagrams: updated, selectedDiagram: selectedDiagram });
        });

        this.state = {
            diagrams: defaultDiagrams,
            selectedDiagram: null,
            syncSocketStatus: 'Initializing...'
        }
    }
    componentWillUnmount() {
      console.log(this.name, 'unmount');
      this.sync.stop();
      delete this.sync.onUpdated;
      delete this.sync;
    }
    render() {
        var classNames = this.preRender(['flow-diagram-edit']);
        var diagramsArray = Utils.toArray(this.state.diagrams.diagrams);
        var nodes = diagramsArray.map((diagram: Models.FlowDiagram) => {
            return (
                <li key={diagram.key} onClick={() => { this.setState({ selectedDiagram: diagram }); } }>{ diagram.name }</li>
            );
        });
        return (
            <div className={classNames.join(' ') }>
            <div>
              <ul>
                { nodes }
              </ul>
            </div>
            {
            this.state.selectedDiagram ? <FlowDiagramEdit diagram={this.state.selectedDiagram}></FlowDiagramEdit> : null
            }
            </div>
        );
    }
}




export interface FlowDiagramEditProps {
    diagram: Models.FlowDiagram;
}
export interface FlowDiagramEditState extends Base.SyncViewState {
    selectedItem: Models.FlowDiagramItem;
}
export class FlowDiagramEdit extends Base.SyncView<FlowDiagramEditProps, FlowDiagramEditState> {
    name: string = '  FlowDiagramEdit';
    constructor(props: FlowDiagramEditProps) {
        super(props);
        this.state = { selectedItem: null };
    }
    componentWillReceiveProps(props: FlowDiagramEditProps) {
        if (this.state.selectedItem) this.setState({ selectedItem: props.diagram.items[this.state.selectedItem.key] });
    }
    newItem() {
        var mutable = {
            key: new Date().toISOString(),
            text: 'New Item',
            position: { x: 0, y: 0 },
            width: 100,
            height: 100
        } as Models.FlowDiagramItem;
        var result = (this.props.diagram.items as Sync.ISyncNode).set(mutable.key, mutable);
        this.setState({ selectedItem: result.value }, () => {
            //(this.refs['menuItemEditModal'] as bv.ModalView).show();
        });
    }
    render() {
        var classNames = this.preRender(['flow-diagram-edit']);
        var itemsArray = Utils.toArray(this.props.diagram.items);
        var nodes = itemsArray.map((item: Models.FlowDiagramItem) => {
            return (
                <FlowDiagramItem item={item} items={this.props.diagram.items} key={item.key}></FlowDiagramItem>
            );
        });
        return (
            <div className={classNames.join(' ') }>
              <button onClick={this.newItem.bind(this) }>New Item</button>

              { nodes }

              <Base.ModalView ref="itemEditModal">

                { this.state.selectedItem ?
                    <h3>Item selected!</h3>
                    : null }

              </Base.ModalView>
            </div>
        );
    }
}

export interface FlowDiagramItemProps {
    key: string;
    item: Models.FlowDiagramItem;
    items: Sync.ISyncNode;
}
export interface FlowDiagramItemState {
    x?: number;
    y?: number;
    dragging?: boolean;
}
export class FlowDiagramItem extends Base.SyncView<FlowDiagramItemProps, FlowDiagramItemState> {
    dragnodestart: any = null;
    dragstart: any = null;
    moveListener: any;
    dropListener: any;
    constructor(props: FlowDiagramItemProps) {
        super(props);
        this.state = { x: props.item.position.x, y: props.item.position.y, dragging: false };
    }
    componentWillReceiveProps(nextProps: FlowDiagramItemProps) {
        if (!this.state.dragging && this.shouldComponentUpdate(nextProps, null)) {
            console.log('nextProps', nextProps.item);
            this.setState({
                x: nextProps.item.position.x,
                y: nextProps.item.position.y
            });
        }
    }
    drag(e: React.SyntheticEvent) {
        this.dragnodestart = [this.state.x, this.state.y];
        this.dragstart = [e['clientX'], e['clientY']];
        console.log('drag', this.props.item.__syncNodeId, this.props.item);
        this.moveListener = this.move.bind(this);
        this.dropListener = this.drop.bind(this);
        this.setState({ dragging: true }, () => {
          document.addEventListener('mousemove', this.moveListener);
          document.addEventListener('mouseup', this.dropListener);
        });
    }
    move(e: React.SyntheticEvent) {
        if (this.state.dragging) {
            var diff = [e['clientX'] - this.dragstart[0], e['clientY'] - this.dragstart[1]];
            var x = this.snapToGrid(this.dragnodestart[0] + diff[0], 25);
            var y = this.snapToGrid(this.dragnodestart[1] + diff[1], 25);
            this.setState({
                x: x,
                y: y
            });
        }
    }
    drop(e: React.SyntheticEvent) {
        console.log('drop', this.props.item.__syncNodeId, this.props.item);
        document.removeEventListener('mousemove', this.moveListener);
        document.removeEventListener('mouseup', this.dropListener);
        //console.log('here', this.props.item.__syncNodeId, this.props.item);
        (this.props.item as Sync.ISyncNode).set('position', {x: this.state.x, y: this.state.y});
        this.setState({ dragging: false }, () => {
          //var mutable = JSON.parse(JSON.stringify(this.props.item)) as Models.FlowDiagramItem;
          //mutable.x = this.state.x;
          //mutable.y = this.state.y;
          //console.log('dropped: ', mutable);
          // var x = this.state.x;
          // var y = this.state.y;
        });
    }
    snapToGrid(val: number, grid: number) {
        var offset = val % grid;
        if (offset < (grid / 2))
            return val - offset;
        else
            return val + (grid - offset);
    }
    render() {
        console.log('         Render flow-diagram-item');
        var classNames = this.preRender(['flow-diagram-item']);
        if(this.state.dragging) classNames.push('dragging');
        var item = this.props.item;
        var style = {
            top: this.state.y + 'px',
            left: this.state.x + 'px',
            width: item.width + 'px',
            height: item.height + 'px',
            lineHeight: item.height + 'px'
        };
        return (
            <div ref="main" key={item.key} className={classNames.join(' ')} style={style}
            onMouseDown={this.drag.bind(this) }>{item.__syncNodeId} {item.text}</div>
        );
    }
}
