/// <reference path="./typings/tsd.d.ts" />

import React = require('react/addons');
import Sync = require('./SyncNode');
import SyncSocket = require('./SyncNodeSocket');
import Base = require('./BaseViews');
import Utils = require('./Utils');
import Models = require('./Models');





export interface FlowDiagramsProps {
    diagrams?: Models.FlowDiagrams;
    path?: string[];
}
export interface FlowDiagramsState extends Base.SyncViewState {
    selectedDiagram?: Models.FlowDiagram;
}
export class FlowDiagrams extends Base.SyncView<FlowDiagramsProps, FlowDiagramsState> {
    constructor(props: FlowDiagramsProps) {
        super(props);
        console.log(props);
        this.state = {
            selectedDiagram: this.getSelectedDiagram(props)
        }
    }
    componentWillReceiveProps(nextProps: FlowDiagramsProps) {
      this.setState({ selectedDiagram: this.getSelectedDiagram(nextProps) });
    }
    getSelectedDiagram(props: FlowDiagramsProps): Models.FlowDiagram {
      var key = props.path[1];
      return key ? props.diagrams.diagrams[key] : null;
    }
    gotoDiagram(key: string) {
      location.hash = '#diagrams/' + key;
    }
    render() {
        var classNames = this.preRender(['flow-diagram-edit']);
        var diagramsArray = Utils.toArray(this.props.diagrams.diagrams);
        var nodes = diagramsArray.map((diagram: Models.FlowDiagram) => {
            return (
                <li key={diagram.key} onClick={() => { this.gotoDiagram(diagram.key); } }>{ diagram.name }</li>
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
            //console.log('state', result, this.state);
        });
    }
    saveItem(item: Models.FlowDiagramItem) {
        var result = (this.props.diagram.items as Sync.ISyncNode).set(this.state.selectedItem.key, item);
        this.setState({ selectedItem: result.value });
    }
    render() {
        var classNames = this.preRender(['flow-diagram-edit']);
        var itemsArray = Utils.toArray(this.props.diagram.items);
        var nodes = itemsArray.map((item: Models.FlowDiagramItem) => {
            var isSelected = this.state.selectedItem && this.state.selectedItem.key === item.key;
            return (
                <FlowDiagramItem item={item} key={item.key} isSelected={isSelected} onSelected={(item: Models.FlowDiagramItem) => { console.log('here'); this.setState({ selectedItem: item }); }}></FlowDiagramItem>
            );
        });
        return (
            <div className={classNames.join(' ') }>
              <div className="drawer-right">
                <button onClick={this.newItem.bind(this) }>New Item</button>
                { this.state.selectedItem ?
                    <div>
                      <h3>Item selected: {this.state.selectedItem.__syncNodeId}</h3>
                      <FlowDiagramItemEdit item={this.state.selectedItem}
                      onSave={ this.saveItem.bind(this) }
                      ></FlowDiagramItemEdit>
                      <button onClick={() => { (this.props.diagram.items as Sync.ISyncNode).remove(this.state.selectedItem.key); this.setState({selectedItem: null}) }}>Delete</button>
                    </div>
                    : null }
              </div>

              { nodes }

            </div>
        );
    }
}





export interface FlowDiagramItemEditProps {
    item: Models.FlowDiagramItem;
    onSave(item: Models.FlowDiagramItem): void;
}
export interface FlowDiagramItemEditState {
    mutable: Models.FlowDiagramItem;
}
export class FlowDiagramItemEdit extends Base.SyncView<FlowDiagramItemEditProps, FlowDiagramItemEditState> {
    constructor(props: FlowDiagramItemEditProps) {
        super(props);
        this.state = {
          mutable: JSON.parse(JSON.stringify(props.item))
        };
    }
    componentWillReceiveProps(nextProps: FlowDiagramItemEditProps) {
      console.log('new Props!', nextProps);
      if(this.shouldComponentUpdate(nextProps, null)) {
        console.log('setting state');
        this.setState({ mutable: JSON.parse(JSON.stringify(nextProps.item)) });
      }
    }
    render() {
        console.log('         Render flow-diagram-item-edit');
        var classNames = this.preRender(['flow-diagram-item-edit']);
        var mutable = this.state.mutable;
        return (
            <div>
              <input value={mutable.text} onChange={this.handleChange.bind(this, 'mutable', 'text')} />
              <input value={mutable.width.toString()} onChange={this.handleChange.bind(this, 'mutable', 'width')} />
              <input value={mutable.height.toString()} onChange={this.handleChange.bind(this, 'mutable', 'height')} />
              <button onClick={() => { this.props.onSave(this.state.mutable); }}>Save</button>
            </div>
        );
    }
}









export interface FlowDiagramItemProps {
    key: string;
    item: Models.FlowDiagramItem;
    isSelected: boolean;
    onSelected(item: Models.FlowDiagramItem): void;
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
            //console.log('nextProps', nextProps.item);
            this.setState({
                x: nextProps.item.position.x,
                y: nextProps.item.position.y
            });
        }
    }
    drag(e: React.SyntheticEvent) {
        this.dragnodestart = [this.state.x, this.state.y];
        this.dragstart = [e['clientX'], e['clientY']];
        //console.log('drag', this.props.item.__syncNodeId, this.props.item);
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
        //console.log('drop', this.props.item.__syncNodeId, this.props.item);
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
        if(this.props.isSelected) classNames.push('selected');
        if(this.state.dragging) classNames.push('dragging');
        var item = this.props.item;
        var style = {
            top: this.state.y + 'px',
            left: this.state.x + 'px',
            width: item.width + 'px',
            height: item.height + 'px'
        };
        return (
            <div ref="main" key={item.key} className={classNames.join(' ')} style={style}
            onMouseDown={this.drag.bind(this) } onClick={() => { this.props.onSelected(item);}}>{item.text}</div>
        );
    }
}
