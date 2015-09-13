/// <reference path="./typings/tsd.d.ts" />
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", 'react/addons', './BaseViews', './Utils'], function (require, exports, React, Base, Utils) {
    var FlowDiagrams = (function (_super) {
        __extends(FlowDiagrams, _super);
        function FlowDiagrams(props) {
            _super.call(this, props);
            console.log(props);
            this.state = {
                selectedDiagram: this.getSelectedDiagram(props)
            };
        }
        FlowDiagrams.prototype.componentWillReceiveProps = function (nextProps) {
            this.setState({ selectedDiagram: this.getSelectedDiagram(nextProps) });
        };
        FlowDiagrams.prototype.getSelectedDiagram = function (props) {
            var key = props.path[1];
            console.log('path', props.path);
            return key ? props.diagrams.diagrams[key] : null;
        };
        FlowDiagrams.prototype.gotoDiagram = function (key) {
            location.hash = '#diagrams/' + key;
        };
        FlowDiagrams.prototype.newDiagram = function () {
            var diagram = {
                key: new Date().toISOString(),
                name: 'New Diagram',
                items: {},
                arrows: {}
            };
            this.props.diagrams.diagrams.set(diagram.key, diagram);
            this.gotoDiagram(diagram.key);
        };
        FlowDiagrams.prototype.deleteDiagram = function (key) {
            if (!confirm('Delete this diagram?'))
                return;
            this.props.diagrams.diagrams.remove(key);
            this.gotoDiagram('');
        };
        FlowDiagrams.prototype.render = function () {
            var _this = this;
            var classNames = this.preRender(['flow-diagram-edit']);
            var diagramsArray = Utils.toArray(this.props.diagrams.diagrams);
            var nodes = diagramsArray.map(function (diagram) {
                return (React.createElement("li", {"key": diagram.key, "onClick": function () { _this.gotoDiagram(diagram.key); }}, diagram.name));
            });
            return (React.createElement("div", {"className": classNames.join(' ')}, React.createElement("div", {"className": "drawer-left"}, React.createElement("ul", null, React.createElement("li", {"onClick": this.newDiagram.bind(this)}, "New Diagram"), nodes)), this.state.selectedDiagram ? React.createElement(FlowDiagramEdit, {"diagram": this.state.selectedDiagram, "onDelete": this.deleteDiagram.bind(this)}) : null));
        };
        return FlowDiagrams;
    })(Base.SyncView);
    exports.FlowDiagrams = FlowDiagrams;
    var FlowDiagramEdit = (function (_super) {
        __extends(FlowDiagramEdit, _super);
        function FlowDiagramEdit(props) {
            _super.call(this, props);
            this.name = '  FlowDiagramEdit';
            this.state = { selectedItem: null, selectedArrow: null };
        }
        FlowDiagramEdit.prototype.componentWillReceiveProps = function (props) {
            if (this.shouldComponentUpdate(props, null)) {
                if (this.state.selectedItem)
                    this.setState({
                        selectedItem: props.diagram.items[this.state.selectedItem.key],
                        mutable: { name: props.diagram.name }
                    });
            }
        };
        FlowDiagramEdit.prototype.newItem = function () {
            var mutable = {
                key: new Date().toISOString(),
                text: 'New Item',
                position: { x: 0, y: 0 },
                width: 100,
                height: 100
            };
            var result = this.props.diagram.items.set(mutable.key, mutable);
            this.setState({ selectedItem: result.value }, function () {
            });
        };
        FlowDiagramEdit.prototype.saveItem = function (item) {
            var result = this.props.diagram.items.set(this.state.selectedItem.key, item);
            this.setState({ selectedItem: result.value });
        };
        FlowDiagramEdit.prototype.newArrow = function () {
            var mutable = {
                key: new Date().toISOString(),
                text: '',
                position: { x: 0, y: 0 },
                width: 100,
                height: 4
            };
            var result = this.props.diagram.arrows.set(mutable.key, mutable);
            console.log('new arrow:', result);
            this.setState({ selectedArrow: result.value });
        };
        FlowDiagramEdit.prototype.saveArrow = function (arrow) {
            var result = this.props.diagram.arrows.set(this.state.selectedArrow.key, arrow);
            this.setState({ selectedArrow: result.value });
        };
        FlowDiagramEdit.prototype.updateDiagramName = function (e) {
            this.props.diagram.set('name', e.target.value);
        };
        FlowDiagramEdit.prototype.render = function () {
            var _this = this;
            var classNames = this.preRender(['flow-diagram-edit']);
            var itemsArray = Utils.toArray(this.props.diagram.items);
            var nodes = itemsArray.map(function (item) {
                var isSelected = _this.state.selectedItem && _this.state.selectedItem.key === item.key;
                return (React.createElement(FlowDiagramItem, {"item": item, "key": item.key, "isSelected": isSelected, "onSelected": function (item) { _this.setState({ selectedItem: item }); }}));
            });
            var arrowsArray = Utils.toArray(this.props.diagram.arrows);
            var arrowNodes = arrowsArray.map(function (arrow) {
                var isSelected = _this.state.selectedArrow && _this.state.selectedArrow.key === arrow.key;
                return (React.createElement(FlowDiagramArrow, {"arrow": arrow, "key": arrow.key, "isSelected": isSelected, "onSelected": function (arrow) { _this.setState({ selectedArrow: arrow }); }}));
            });
            return (React.createElement("div", {"className": classNames.join(' ')}, React.createElement("div", {"className": "drawer-right"}, React.createElement("button", {"onClick": this.newItem.bind(this)}, "New Item"), React.createElement("button", {"onClick": this.newArrow.bind(this)}, "New Arrow"), React.createElement("button", {"onClick": function () { _this.props.onDelete(_this.props.diagram.key); }}, "Delete"), React.createElement("input", {"ref": "diagramName", "value": this.props.diagram.name, "onChange": this.handleChange.bind(this, 'mutable', 'name'), "onBlur": this.updateDiagramName.bind(this)}), this.state.selectedItem ?
                React.createElement("div", null, React.createElement("h3", null, "Edit Item"), React.createElement(FlowDiagramItemEdit, {"item": this.state.selectedItem, "onSave": this.saveItem.bind(this)}), React.createElement("button", {"onClick": function () { _this.props.diagram.items.remove(_this.state.selectedItem.key); _this.setState({ selectedItem: null }); }}, "Delete"))
                : null, this.state.selectedArrow ?
                React.createElement("div", null, React.createElement("h3", null, "Edit Arrow"), React.createElement(FlowDiagramArrowEdit, {"arrow": this.state.selectedArrow, "onSave": this.saveArrow.bind(this)}), React.createElement("button", {"onClick": function () { _this.props.diagram.arrows.remove(_this.state.selectedArrow.key); _this.setState({ selectedArrow: null }); }}, "Delete"))
                : null), React.createElement("div", {"className": "flow-diagram"}, arrowNodes, nodes)));
        };
        return FlowDiagramEdit;
    })(Base.SyncView);
    exports.FlowDiagramEdit = FlowDiagramEdit;
    var FlowDiagramItemEdit = (function (_super) {
        __extends(FlowDiagramItemEdit, _super);
        function FlowDiagramItemEdit(props) {
            _super.call(this, props);
            this.state = {
                mutable: JSON.parse(JSON.stringify(props.item))
            };
        }
        FlowDiagramItemEdit.prototype.componentWillReceiveProps = function (nextProps) {
            console.log('new Props!', nextProps);
            if (this.shouldComponentUpdate(nextProps, null)) {
                console.log('setting state');
                this.setState({ mutable: JSON.parse(JSON.stringify(nextProps.item)) });
            }
        };
        FlowDiagramItemEdit.prototype.save = function () {
            this.props.onSave(this.state.mutable);
        };
        FlowDiagramItemEdit.prototype.render = function () {
            console.log('         Render flow-diagram-item-edit');
            var classNames = this.preRender(['flow-diagram-item-edit']);
            var mutable = this.state.mutable;
            return (React.createElement("div", null, React.createElement("input", {"value": mutable.text, "onChange": this.handleChange.bind(this, 'mutable', 'text'), "onBlur": this.save.bind(this)}), React.createElement("input", {"value": mutable.width.toString(), "onChange": this.handleChange.bind(this, 'mutable', 'width'), "onBlur": this.save.bind(this)}), React.createElement("input", {"value": mutable.height.toString(), "onChange": this.handleChange.bind(this, 'mutable', 'height'), "onBlur": this.save.bind(this)})));
        };
        return FlowDiagramItemEdit;
    })(Base.SyncView);
    exports.FlowDiagramItemEdit = FlowDiagramItemEdit;
    var FlowDiagramItem = (function (_super) {
        __extends(FlowDiagramItem, _super);
        function FlowDiagramItem(props) {
            _super.call(this, props);
            this.dragnodestart = null;
            this.dragstart = null;
            this.state = { x: props.item.position.x, y: props.item.position.y, dragging: false };
        }
        FlowDiagramItem.prototype.componentWillReceiveProps = function (nextProps) {
            if (!this.state.dragging && this.shouldComponentUpdate(nextProps, null)) {
                this.setState({
                    x: nextProps.item.position.x,
                    y: nextProps.item.position.y
                });
            }
        };
        FlowDiagramItem.prototype.drag = function (e) {
            var _this = this;
            this.dragnodestart = [this.state.x, this.state.y];
            this.dragstart = [e['clientX'], e['clientY']];
            this.moveListener = this.move.bind(this);
            this.dropListener = this.drop.bind(this);
            this.setState({ dragging: true }, function () {
                document.addEventListener('mousemove', _this.moveListener);
                document.addEventListener('mouseup', _this.dropListener);
            });
        };
        FlowDiagramItem.prototype.move = function (e) {
            if (this.state.dragging) {
                var diff = [e['clientX'] - this.dragstart[0], e['clientY'] - this.dragstart[1]];
                var x = Utils.snapToGrid(this.dragnodestart[0] + diff[0], 25);
                var y = Utils.snapToGrid(this.dragnodestart[1] + diff[1], 25);
                this.setState({
                    x: x,
                    y: y
                });
            }
        };
        FlowDiagramItem.prototype.drop = function (e) {
            document.removeEventListener('mousemove', this.moveListener);
            document.removeEventListener('mouseup', this.dropListener);
            this.props.item.set('position', { x: this.state.x, y: this.state.y });
            this.setState({ dragging: false });
        };
        FlowDiagramItem.prototype.render = function () {
            var _this = this;
            console.log('         Render flow-diagram-item');
            var classNames = this.preRender(['flow-diagram-item']);
            if (this.props.isSelected)
                classNames.push('selected');
            if (this.state.dragging)
                classNames.push('dragging');
            var item = this.props.item;
            var style = {
                top: this.state.y + 'px',
                left: this.state.x + 'px',
                width: item.width + 'px',
                height: item.height + 'px'
            };
            return (React.createElement("div", {"ref": "main", "key": item.key, "className": classNames.join(' '), "style": style, "onMouseDown": this.drag.bind(this), "onClick": function () { _this.props.onSelected(item); }}, item.text));
        };
        return FlowDiagramItem;
    })(Base.SyncView);
    exports.FlowDiagramItem = FlowDiagramItem;
    var FlowDiagramArrowEdit = (function (_super) {
        __extends(FlowDiagramArrowEdit, _super);
        function FlowDiagramArrowEdit(props) {
            _super.call(this, props);
            this.state = {
                mutable: JSON.parse(JSON.stringify(props.arrow))
            };
        }
        FlowDiagramArrowEdit.prototype.componentWillReceiveProps = function (nextProps) {
            console.log('new Props!', nextProps);
            if (this.shouldComponentUpdate(nextProps, null)) {
                console.log('setting state');
                this.setState({ mutable: JSON.parse(JSON.stringify(nextProps.arrow)) });
            }
        };
        FlowDiagramArrowEdit.prototype.save = function () {
            this.props.onSave(this.state.mutable);
        };
        FlowDiagramArrowEdit.prototype.render = function () {
            console.log('         Render flow-diagram-arrow-edit');
            var classNames = this.preRender(['flow-diagram-arrow-edit']);
            var mutable = this.state.mutable;
            return (React.createElement("div", null, React.createElement("input", {"value": mutable.text, "onChange": this.handleChange.bind(this, 'mutable', 'text'), "onBlur": this.save.bind(this)}), React.createElement("input", {"value": mutable.width.toString(), "onChange": this.handleChange.bind(this, 'mutable', 'width'), "onBlur": this.save.bind(this)}), React.createElement("input", {"value": mutable.height.toString(), "onChange": this.handleChange.bind(this, 'mutable', 'height'), "onBlur": this.save.bind(this)})));
        };
        return FlowDiagramArrowEdit;
    })(Base.SyncView);
    exports.FlowDiagramArrowEdit = FlowDiagramArrowEdit;
    var FlowDiagramArrow = (function (_super) {
        __extends(FlowDiagramArrow, _super);
        function FlowDiagramArrow(props) {
            _super.call(this, props);
            this.dragnodestart = null;
            this.dragstart = null;
            this.state = { x: props.arrow.position.x, y: props.arrow.position.y, dragging: false };
        }
        FlowDiagramArrow.prototype.drag = function (e) {
            var _this = this;
            this.dragnodestart = [this.state.x, this.state.y];
            this.dragstart = [e['clientX'], e['clientY']];
            this.moveListener = this.move.bind(this);
            this.dropListener = this.drop.bind(this);
            this.setState({ dragging: true }, function () {
                document.addEventListener('mousemove', _this.moveListener);
                document.addEventListener('mouseup', _this.dropListener);
            });
        };
        FlowDiagramArrow.prototype.move = function (e) {
            if (this.state.dragging) {
                var diff = [e['clientX'] - this.dragstart[0], e['clientY'] - this.dragstart[1]];
                var x = Utils.snapToGrid(this.dragnodestart[0] + diff[0], 25);
                var y = Utils.snapToGrid(this.dragnodestart[1] + diff[1], 25);
                this.setState({
                    x: x,
                    y: y
                });
            }
        };
        FlowDiagramArrow.prototype.drop = function (e) {
            document.removeEventListener('mousemove', this.moveListener);
            document.removeEventListener('mouseup', this.dropListener);
            this.props.arrow.set('position', { x: this.state.x, y: this.state.y });
            this.setState({ dragging: false });
        };
        FlowDiagramArrow.prototype.render = function () {
            var _this = this;
            console.log('         Render flow-diagram-arrow');
            var classNames = this.preRender(['flow-diagram-arrow']);
            if (this.props.isSelected)
                classNames.push('selected');
            if (this.state.dragging)
                classNames.push('dragging');
            var arrow = this.props.arrow;
            var style = {
                top: this.state.y + 'px',
                left: this.state.x + 'px',
                width: arrow.width + 'px',
                height: arrow.height + 'px'
            };
            var svgStyle = {
                position: 'absolute',
                left: this.state.x,
                top: this.state.y,
                width: this.props.arrow.width,
                height: this.props.arrow.height
            };
            return (React.createElement("svg", {"style": svgStyle}, React.createElement("line", {"x1": "0", "y1": "0", "x2": this.props.arrow.width, "y2": this.props.arrow.height, "stroke": "#000", "strokeWidth": "5", "onMouseDown": this.drag.bind(this), "onClick": function () { _this.props.onSelected(_this.props.arrow); }})));
        };
        return FlowDiagramArrow;
    })(Base.SyncView);
    exports.FlowDiagramArrow = FlowDiagramArrow;
});
//# sourceMappingURL=Flow.js.map