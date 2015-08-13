/// <reference path="./typings/tsd.d.ts" />
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", 'react/addons'], function (require, exports, React) {
    var SyncView = (function (_super) {
        __extends(SyncView, _super);
        function SyncView() {
            _super.apply(this, arguments);
            this.name = 'SynceView';
        }
        SyncView.prototype.isShallowDiff = function (curr, next) {
            var equal = true;
            if (curr === null || next === null || typeof curr !== 'object' || typeof next !== 'object') {
                return curr !== next;
            }
            Object.keys(next).forEach(function (key) {
                if (typeof next[key] === 'function') {
                }
                else if (curr[key] === null || next[key] === null) {
                    equal = equal && curr[key] === next[key];
                }
                else if (!curr[key].hasOwnProperty('lastModified') || !next[key].hasOwnProperty('lastModified')) {
                    equal = equal && (curr[key] === next[key]);
                }
                else {
                    equal = equal && (curr[key].lastModified === next[key].lastModified);
                }
            });
            return !equal;
        };
        SyncView.prototype.shouldComponentUpdate = function (nextProps, nextState) {
            var propsDiff = this.isShallowDiff(this.props, nextProps);
            var stateDiff = this.isShallowDiff(this.state, nextState);
            var shouldUpdate = propsDiff || stateDiff;
            return shouldUpdate;
        };
        return SyncView;
    })(React.Component);
    exports.SyncView = SyncView;
});
//# sourceMappingURL=BaseViews.js.map