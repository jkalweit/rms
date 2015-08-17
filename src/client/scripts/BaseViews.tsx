/// <reference path="./typings/tsd.d.ts" />


import React = require('react/addons');

export interface SyncViewState {
    isNew?: boolean;
}

export class SyncView<P, S extends SyncViewState> extends React.Component<P, S> {
    name: string = 'SynceView'; //For debugging output
    constructor(props: P) {
      super(props);
      this.state = {} as S;
    }
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
    componentWillReceiveProps(nextProps: P, nextState: S) {
      if(this.shouldComponentUpdate(nextProps, nextState)) {
          this.setState({ isNew: true } as any);
      }
    }

    preRender(): string[] {
      console.log(this.name, 'Render');
      var classNames: string[] = ['flash'];
      if(this.state.isNew) {
        classNames.push('glow');
        setTimeout(() => { this.setState({ isNew: false } as any); }, 200);
      }
      return classNames;
    }
}






export class SimpleConfirmView extends React.Component<any, any> {
    doCallback(name: string) {
        if (this.props[name]) this.props[name]();
    }
    render() {

        var hide = { display: this.props.onRemove ? 'block' : 'none' };
        var style = {
            clear: 'both',
            margin: '10px',
            minHeight: '40px',
            position: 'absolute',
            bottom: 0,
            left: 0
        };

        return (
            <div style={style}>
         <Button className="col-4 btn-confirm" onClick={() => { this.doCallback('onSave'); } } disabled={!this.props.isDirty}>Save</Button>
         <Button className="col-4 btn-cancel" onClick={() => { this.doCallback('onCancel'); } }>Cancel</Button>
         <Button className="col-4 btn-delete" onClick={() => { this.doCallback('onRemove'); } } style={hide}>Delete</Button>
            </div>
        );
    }
}


export interface ButtonProps {
    onClick: (e: React.MouseEvent) => void;
    className?: string;
    style?: any;
    children?: any;
    disabled?: boolean;
}
export interface ButtonState {
    isPressed?: boolean;
}
export class Button extends React.Component<ButtonProps, ButtonState> {
    constructor(props: ButtonProps) {
        super(props);
        this.state = {
            isPressed: false
        }
    }
    handleClick(e: React.MouseEvent) {
        this.setState({ isPressed: true });
        setTimeout(() => { this.setState({ isPressed: false }) }, 100); // set ms to twice the transition for in and out.
        if (this.props.onClick) this.props.onClick(e);
    }
    render() {
        var classes = this.props.className || "";
        classes = 'btn ' + classes + (this.state.isPressed ? ' pressed' : '');
        return (
            <button className={classes} style={this.props.style} onClick={(e) => { this.handleClick(e) } }>{this.props.children}</button>
        );
    }

}
