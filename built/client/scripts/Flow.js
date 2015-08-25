/// <reference path="./typings/tsd.d.ts" />
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", 'react/addons', './SyncNodeSocket', './BaseViews', './Utils'], function (require, exports, React, SyncSocket, Base, Utils) {
    var FlowDiagrams = (function (_super) {
        __extends(FlowDiagrams, _super);
        function FlowDiagrams(props) {
            var _this = this;
            _super.call(this, props);
            var defaultDiagrams;
            defaultDiagrams = {
                diagrams: {
                    '0': {
                        key: '0',
                        name: 'New Diagram',
                        items: {}
                    }
                }
            };
            var sync = new SyncSocket.SyncNodeSocket('/flowdiagrams', defaultDiagrams);
            sync.onStatusChanged = function (path, status) {
                _this.setState({ syncSocketStatus: status });
            };
            sync.onUpdated(function (updated) {
                console.log('updated!', updated);
                var selectedDiagram = _this.state.selectedDiagram;
                if (selectedDiagram)
                    selectedDiagram = updated.diagrams[selectedDiagram.key];
                _this.setState({ diagrams: updated, selectedDiagram: selectedDiagram });
            });
            this.state = {
                diagrams: defaultDiagrams,
                selectedDiagram: null,
                syncSocketStatus: 'Initializing...'
            };
        }
        FlowDiagrams.prototype.render = function () {
            var _this = this;
            var classNames = this.preRender(['flow-diagram-edit']);
            var diagramsArray = Utils.toArray(this.state.diagrams.diagrams);
            var nodes = diagramsArray.map(function (diagram) {
                return (React.createElement("li", {"key": diagram.key, "onClick": function () { _this.setState({ selectedDiagram: diagram }); }}, diagram.name));
            });
            return (React.createElement("div", {"className": classNames.join(' ')}, React.createElement("div", null, React.createElement("ul", null, nodes)), this.state.selectedDiagram ? React.createElement(FlowDiagramEdit, {"diagram": this.state.selectedDiagram}) : null));
        };
        return FlowDiagrams;
    })(Base.SyncView);
    exports.FlowDiagrams = FlowDiagrams;
    var FlowDiagramEdit = (function (_super) {
        __extends(FlowDiagramEdit, _super);
        function FlowDiagramEdit(props) {
            _super.call(this, props);
            this.name = '  FlowDiagramEdit';
            this.state = { selectedItem: null };
        }
        FlowDiagramEdit.prototype.componentWillReceiveProps = function (props) {
            if (this.state.selectedItem)
                this.setState({ selectedItem: props.diagram.items[this.state.selectedItem.key] });
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
        FlowDiagramEdit.prototype.render = function () {
            var _this = this;
            var classNames = this.preRender(['flow-diagram-edit']);
            var itemsArray = Utils.toArray(this.props.diagram.items);
            var nodes = itemsArray.map(function (item) {
                return (React.createElement(FlowDiagramItem, {"item": item, "items": _this.props.diagram.items, "key": item.key}));
            });
            return (React.createElement("div", {"className": classNames.join(' ')}, React.createElement("button", {"onClick": this.newItem.bind(this)}, "New Item"), nodes, React.createElement(Base.ModalView, {"ref": "itemEditModal"}, this.state.selectedItem ?
                React.createElement("h3", null, "Item selected!")
                : null)));
        };
        return FlowDiagramEdit;
    })(Base.SyncView);
    exports.FlowDiagramEdit = FlowDiagramEdit;
    var FlowDiagramItem = (function (_super) {
        __extends(FlowDiagramItem, _super);
        function FlowDiagramItem(props) {
            _super.call(this, props);
            this.dragnodestart = null;
            this.dragstart = null;
            this.moveListener = this.move.bind(this);
            this.dropListener = this.drop.bind(this);
            this.state = { x: props.item.position.x, y: props.item.position.y, dragging: false };
        }
        FlowDiagramItem.prototype.componentWillReceiveProps = function (nextProps) {
            if (!this.state.dragging && this.shouldComponentUpdate(nextProps, null)) {
                console.log('nextProps', nextProps.item);
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
            console.log('drag', this.props.item);
            this.setState({ dragging: true }, function () {
                document.addEventListener('mousemove', _this.moveListener);
                document.addEventListener('mouseup', _this.dropListener);
            });
        };
        FlowDiagramItem.prototype.move = function (e) {
            if (this.state.dragging) {
                var diff = [e['clientX'] - this.dragstart[0], e['clientY'] - this.dragstart[1]];
                var x = this.snapToGrid(this.dragnodestart[0] + diff[0], 25);
                var y = this.snapToGrid(this.dragnodestart[1] + diff[1], 25);
                this.setState({
                    x: x,
                    y: y
                });
            }
        };
        FlowDiagramItem.prototype.drop = function (e) {
            var _this = this;
            this.setState({ dragging: false }, function () {
                document.removeEventListener('mousemove', _this.moveListener);
                document.removeEventListener('mouseup', _this.dropListener);
                _this.props.item.set('position', { x: _this.state.x, y: _this.state.y });
            });
        };
        FlowDiagramItem.prototype.snapToGrid = function (val, grid) {
            var offset = val % grid;
            if (offset < (grid / 2))
                return val - offset;
            else
                return val + (grid - offset);
        };
        FlowDiagramItem.prototype.render = function () {
            console.log('         Render flow-diagram-item');
            var classNames = this.preRender(['flow-diagram-item']);
            if (this.state.dragging)
                classNames.push('dragging');
            var item = this.props.item;
            var style = {
                top: this.state.y + 'px',
                left: this.state.x + 'px',
                width: item.width + 'px',
                height: item.height + 'px',
                lineHeight: item.height + 'px'
            };
            return (React.createElement("div", {"ref": "main", "key": item.key, "className": classNames.join(' '), "style": style, "onMouseDown": this.drag.bind(this)}, item.text));
        };
        return FlowDiagramItem;
    })(Base.SyncView);
    exports.FlowDiagramItem = FlowDiagramItem;
});
//# sourceMappingURL=Flow.js.map