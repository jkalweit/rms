/// <reference path="./typings/tsd.d.ts" />


import React = require('react/addons');

export class SyncView<P, S> extends React.Component<P, S> {
    name: string = 'SynceView'; //For debugging output
    isShallowDiff(curr: any, next: any): boolean {
        var equal = true;
        if (curr === null || next === null || typeof curr !== 'object' || typeof next !== 'object') {
            //console.log('isShallowDiff: an argument is either null or not an object, doing === compare.');
            return curr !== next;
        }
        Object.keys(next).forEach((key) => {
            if (typeof next[key] === 'function') {
                //ignore functions
            } else {
                equal = equal && curr[key] === next[key];
            }
            //if (!equal) console.log('      NOT EQUAL', key);
            //else console.log('EQUAL', key);
            // //console.log(key, curr, next);

            // else if(curr[key] === null || next[key] === null) {
            //   equal = equal && curr[key] === next[key];
            // }
            // else if (!curr[key].hasOwnProperty('lastModified') || !next[key].hasOwnProperty('lastModified')) {
            //     //console.log(this.name + ' has no lastModified: ' + key + ': ', curr[key], next[key], curr[key] === next[key]);
            //     equal = equal && (curr[key] === next[key]);
            // } else {
            //     equal = equal && (curr[key].lastModified === next[key].lastModified);
            // }
        });
        return !equal;
    }
    shouldComponentUpdate(nextProps: P, nextState: S) {
        var propsDiff = this.isShallowDiff(this.props, nextProps);
        var stateDiff = this.isShallowDiff(this.state, nextState);
        var shouldUpdate = propsDiff || stateDiff;
        // console.log('state: ', this.state);
        // console.log('nextState: ', nextState);
        // console.log('props: ', propsDiff, 'state: ', stateDiff, 'update: ', shouldUpdate);
        // if (shouldUpdate) console.log(this.name + ': UPDATE ');
        // else console.log(this.name + '         : NO UPDATE ');
        return shouldUpdate;
    }
}
