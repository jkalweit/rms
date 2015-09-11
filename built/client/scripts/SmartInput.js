/// <reference path="./typings/tsd.d.ts" />
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", 'react/addons'], function (require, exports, React) {
    var SmartInput = (function (_super) {
        __extends(SmartInput, _super);
        function SmartInput(props) {
            _super.call(this, props);
            this.state = {
                value: props.model[props.modelProp]
            };
        }
        SmartInput.prototype.componentWillReceiveProps = function (props) {
            this.setState({ value: props.model[props.modelProp] });
        };
        SmartInput.prototype.save = function (value) {
            var shouldSave = true;
            if (this.props.onSave) {
                shouldSave = this.props.onSave(value);
            }
            if (shouldSave) {
                var val = value;
                if (this.props.isNumber) {
                    val = parseFloat(val);
                    console.log('converting to number', value, val);
                }
                this.props.model.set(this.props.modelProp, val);
            }
        };
        SmartInput.prototype.render = function () {
            var _this = this;
            if (this.props.isMultiline) {
                var numLines = this.state.value ? this.state.value.split(/\r\n|\r|\n/).length : 1;
                return (React.createElement("textarea", {"rows": numLines, "className": this.props.className, "type": "text", "value": this.state.value, "onClick": function (e) { e.stopPropagation(); }, "onChange": function (e) { _this.setState({ value: e.target.value }); }, "onBlur": function (e) { _this.save(e.target.value); }}));
            }
            else {
                return (React.createElement("input", {"className": this.props.className, "type": "text", "value": this.state.value, "onClick": function (e) { e.stopPropagation(); e.target.select(); }, "onChange": function (e) { _this.setState({ value: e.target.value }); }, "onBlur": function (e) { _this.save(e.target.value); }}));
            }
        };
        return SmartInput;
    })(React.Component);
    exports.SmartInput = SmartInput;
});
//# sourceMappingURL=SmartInput.js.map