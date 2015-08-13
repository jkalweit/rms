/// <reference path="./typings/tsd.d.ts" />

import React = require('react/addons');


export interface NavigatorProps {
    hash: string;
    children?: any;
    onSelect?: (url: string) => void;
}
export interface NavigationState {
  isSelected?: boolean;
}
export class NavigationBase extends React.Component<NavigatorProps, NavigationState> {
    constructor(props: NavigatorProps) {
        super(props);
        this.state = { isSelected: this.compareHash() };
        window.addEventListener('hashchange', () => {
            this.setState({ isSelected: this.compareHash() });
        });
    }
    compareHash(): boolean {
        var normalizedHash = (location.hash || '').toLowerCase();
        if (normalizedHash == '') normalizedHash = '#';

        return normalizedHash == this.props.hash;
    }
    render() {
        return (<div>Navigator Base is an abstract class.You must implement your own render().</div>);
    }
}


export class NavigationView extends NavigationBase {
    render() {
        var style = {
            zIndex: this.state.isSelected ? 1 : 0,
            opacity: this.state.isSelected ? 1 : 0
        };

        return (
            <div className="navigation-view" style={style}>
              { this.props.children }
            </div>
        );
    }
}

export class NavigationItem extends NavigationView {
    render() {
        var className = this.state.isSelected ? 'active' : '';
        return (
            <a className={className} onClick={ () => { this.props.onSelect(this.props.hash); }} href={this.props.hash}>
              { this.props.children }
            </a>
        );
    }
}
