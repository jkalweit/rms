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
      console.log('path', props.path);
      return key ? props.diagrams.diagrams[key] : null;
    }
    gotoDiagram(key: string) {
      location.hash = '#diagrams/' + key;
    }
    newDiagram() {
      var diagram: Models.FlowDiagram = {
        key: new Date().toISOString(),
        name: 'New Diagram',
        items: {},
        arrows: {}
      };
      (this.props.diagrams.diagrams as Sync.ISyncNode).set(diagram.key, diagram);
      this.gotoDiagram(diagram.key);
    }
    deleteDiagram(key: string) {
        if(!confirm('Delete this diagram?')) return;
        (this.props.diagrams.diagrams as Sync.ISyncNode).remove(key);
        //this.setState({ selectedDiagram: null });
        this.gotoDiagram('');
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
              <div className="drawer-left">
                <ul>
                  <li onClick={ this.newDiagram.bind(this) }>New Diagram</li>
                  { nodes }
                </ul>
              </div>
            {
              this.state.selectedDiagram ? <FlowDiagramEdit diagram={this.state.selectedDiagram} onDelete={ this.deleteDiagram.bind(this) }></FlowDiagramEdit> : null
            }
            </div>
        );
    }
}




export interface FlowDiagramEditProps {
    diagram: Models.FlowDiagram;
    onDelete(key: string): void;
}
export interface FlowDiagramEditState extends Base.SyncViewState {
    selectedItem?: Models.FlowDiagramItem;
    selectedArrow?: Models.FlowDiagramArrow;
    mutable?: Models.FlowDiagram;
}
export class FlowDiagramEdit extends Base.SyncView<FlowDiagramEditProps, FlowDiagramEditState> {
    name: string = '  FlowDiagramEdit';
    constructor(props: FlowDiagramEditProps) {
        super(props);
        this.state = { selectedItem: null, selectedArrow: null };
    }
    componentWillReceiveProps(props: FlowDiagramEditProps) {
        if(this.shouldComponentUpdate(props, null)) {
          if (this.state.selectedItem) this.setState({
            selectedItem: props.diagram.items[this.state.selectedItem.key],
            mutable: { name: props.diagram.name } as Models.FlowDiagram
          });
        }
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
    newArrow() {
        var mutable = {
            key: new Date().toISOString(),
            text: '',
            position: { x: 0, y: 0 },
            width: 100,
            height: 4
        } as Models.FlowDiagramArrow;
        var result = (this.props.diagram.arrows as Sync.ISyncNode).set(mutable.key, mutable);
        console.log('new arrow:', result);
        this.setState({ selectedArrow: result.value });
    }
    saveArrow(arrow: Models.FlowDiagramArrow) {
        var result = (this.props.diagram.arrows as Sync.ISyncNode).set(this.state.selectedArrow.key, arrow);
        this.setState({ selectedArrow: result.value });
    }
    updateDiagramName(e: Event) {
        (this.props.diagram as Sync.ISyncNode).set('name', (e.target as any).value);
    }
    render() {
        var classNames = this.preRender(['flow-diagram-edit']);
        var itemsArray = Utils.toArray(this.props.diagram.items);
        var nodes = itemsArray.map((item: Models.FlowDiagramItem) => {
            var isSelected = this.state.selectedItem && this.state.selectedItem.key === item.key;
            return (
                <FlowDiagramItem item={item} key={item.key} isSelected={isSelected} onSelected={(item: Models.FlowDiagramItem) => { this.setState({ selectedItem: item }); }}></FlowDiagramItem>
            );
        });

        var arrowsArray = Utils.toArray(this.props.diagram.arrows);
        var arrowNodes = arrowsArray.map((arrow: Models.FlowDiagramArrow) => {
            var isSelected = this.state.selectedArrow && this.state.selectedArrow.key === arrow.key;
            return (
                <FlowDiagramArrow arrow={arrow} key={arrow.key} isSelected={isSelected} onSelected={(arrow: Models.FlowDiagramArrow) => { this.setState({ selectedArrow: arrow }); }}></FlowDiagramArrow>
            );
        });

        return (
            <div className={classNames.join(' ') }>
              <div className="drawer-right">
                <button onClick={this.newItem.bind(this) }>New Item</button>
                <button onClick={this.newArrow.bind(this) }>New Arrow</button>
                <button onClick={() => { this.props.onDelete(this.props.diagram.key); }}>Delete</button>
                <input ref="diagramName" value={ this.props.diagram.name } onChange={ this.handleChange.bind(this, 'mutable', 'name') } onBlur={ this.updateDiagramName.bind(this) } />
                { this.state.selectedItem ?
                    <div>
                      <h3>Edit Item</h3>
                      <FlowDiagramItemEdit item={this.state.selectedItem}
                      onSave={ this.saveItem.bind(this) }
                      ></FlowDiagramItemEdit>
                      <button onClick={() => { (this.props.diagram.items as Sync.ISyncNode).remove(this.state.selectedItem.key); this.setState({selectedItem: null}) }}>Delete</button>
                    </div>
                    : null }

                    { this.state.selectedArrow ?
                        <div>
                          <h3>Edit Arrow</h3>
                          <FlowDiagramArrowEdit arrow={this.state.selectedArrow}
                          onSave={ this.saveArrow.bind(this) }
                          ></FlowDiagramArrowEdit>
                          <button onClick={() => { (this.props.diagram.arrows as Sync.ISyncNode).remove(this.state.selectedArrow.key); this.setState({selectedArrow: null}) }}>Delete</button>
                        </div>
                        : null }
              </div>

              <div className="flow-diagram">

                { arrowNodes }

                { nodes }

              </div>

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
    save() {
      this.props.onSave(this.state.mutable);
    }
    render() {
        console.log('         Render flow-diagram-item-edit');
        var classNames = this.preRender(['flow-diagram-item-edit']);
        var mutable = this.state.mutable;
        return (
            <div>
              <input value={mutable.text} onChange={this.handleChange.bind(this, 'mutable', 'text')} onBlur={ this.save.bind(this) } />
              <input value={mutable.width.toString()} onChange={this.handleChange.bind(this, 'mutable', 'width')} onBlur={ this.save.bind(this) } />
              <input value={mutable.height.toString()} onChange={this.handleChange.bind(this, 'mutable', 'height')} onBlur={ this.save.bind(this) } />
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
            var x = Utils.snapToGrid(this.dragnodestart[0] + diff[0], 25);
            var y = Utils.snapToGrid(this.dragnodestart[1] + diff[1], 25);
            this.setState({
                x: x,
                y: y
            });
        }
    }
    drop(e: React.SyntheticEvent) {
        document.removeEventListener('mousemove', this.moveListener);
        document.removeEventListener('mouseup', this.dropListener);
        (this.props.item as Sync.ISyncNode).set('position', {x: this.state.x, y: this.state.y});
        this.setState({ dragging: false });
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








export interface FlowDiagramArrowEditProps {
    arrow: Models.FlowDiagramArrow;
    onSave(item: Models.FlowDiagramArrow): void;
}
export interface FlowDiagramArrowEditState {
    mutable: Models.FlowDiagramArrow;
}
export class FlowDiagramArrowEdit extends Base.SyncView<FlowDiagramArrowEditProps, FlowDiagramArrowEditState> {
    constructor(props: FlowDiagramArrowEditProps) {
        super(props);
        this.state = {
          mutable: JSON.parse(JSON.stringify(props.arrow))
        };
    }
    componentWillReceiveProps(nextProps: FlowDiagramArrowEditProps) {
      console.log('new Props!', nextProps);
      if(this.shouldComponentUpdate(nextProps, null)) {
        console.log('setting state');
        this.setState({ mutable: JSON.parse(JSON.stringify(nextProps.arrow)) });
      }
    }
    save() {
      this.props.onSave(this.state.mutable);
    }
    render() {
        console.log('         Render flow-diagram-arrow-edit');
        var classNames = this.preRender(['flow-diagram-arrow-edit']);
        var mutable = this.state.mutable;
        return (
            <div>
              <input value={mutable.text} onChange={this.handleChange.bind(this, 'mutable', 'text')} onBlur={ this.save.bind(this) } />
              <input value={mutable.width.toString()} onChange={this.handleChange.bind(this, 'mutable', 'width')} onBlur={ this.save.bind(this) } />
              <input value={mutable.height.toString()} onChange={this.handleChange.bind(this, 'mutable', 'height')} onBlur={ this.save.bind(this) } />
            </div>
        );
    }
}











export interface FlowDiagramArrowProps {
    key: string;
    arrow: Models.FlowDiagramArrow;
    isSelected: boolean;
    onSelected(item: Models.FlowDiagramArrow): void;
}
export interface FlowDiagramArrowState {
    x?: number;
    y?: number;
    dragging?: boolean;
}
export class FlowDiagramArrow extends Base.SyncView<FlowDiagramArrowProps, FlowDiagramArrowState> {
    dragnodestart: any = null;
    dragstart: any = null;
    moveListener: any;
    dropListener: any;
    constructor(props: FlowDiagramArrowProps) {
        super(props);
        this.state = { x: props.arrow.position.x, y: props.arrow.position.y, dragging: false };
    }
    drag(e: React.SyntheticEvent) {
        this.dragnodestart = [this.state.x, this.state.y];
        this.dragstart = [e['clientX'], e['clientY']];
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
            var x = Utils.snapToGrid(this.dragnodestart[0] + diff[0], 25);
            var y = Utils.snapToGrid(this.dragnodestart[1] + diff[1], 25);
            this.setState({
                x: x,
                y: y
            });
        }
    }
    drop(e: React.SyntheticEvent) {
        document.removeEventListener('mousemove', this.moveListener);
        document.removeEventListener('mouseup', this.dropListener);
        (this.props.arrow as Sync.ISyncNode).set('position', {x: this.state.x, y: this.state.y});
        this.setState({ dragging: false });
    }
    render() {
        console.log('         Render flow-diagram-arrow');
        var classNames = this.preRender(['flow-diagram-arrow']);
        if(this.props.isSelected) classNames.push('selected');
        if(this.state.dragging) classNames.push('dragging');
        var arrow = this.props.arrow;
        var style = {
            top: this.state.y + 'px',
            left: this.state.x + 'px',
            width: arrow.width + 'px',
            height: arrow.height + 'px'
        };
        // return (
        //     <div ref="main" key={arrow.key} className={classNames.join(' ')} onMouseDown={ this.drag.bind(this) } onClick={() => { this.props.onSelected(this.props.arrow); }} style={style}>{arrow.text}</div>
        // );

        var svgStyle = {
          position: 'absolute',
          left: this.state.x,
          top: this.state.y,
          width: this.props.arrow.width,
          height: this.props.arrow.height
        };

        return (
          <svg style={svgStyle}>
            <defs>
              <marker id="arrow" marker-width="10" marker-height="10" refx="0" refy="3" orient="auto" markerUnits="strokeWidth">
                <path d="M0,0 L0,6 L9,3 z" fill="#f00" />
              </marker>
            </defs>

            <line x1="0" y1="0" x2={this.props.arrow.width} y2={this.props.arrow.height} stroke="#000" strokeWidth="5" markerEnd="url(#arrow)" onMouseDown={ this.drag.bind(this) } onClick={() => { this.props.onSelected(this.props.arrow); }} />
          </svg>
        );
    }
}
