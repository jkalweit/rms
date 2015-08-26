/// <reference path="./typings/tsd.d.ts" />

import React = require('react/addons');


export interface NavigatorProps {
    hash: string;
    children?: any;
    onSelect?: (url: string) => void;
}
export interface NavigationState {
  isSelected?: boolean;
  path?: string[];
  query?: {[key: string]: string | boolean};
}
export class NavigationBase extends React.Component<NavigatorProps, NavigationState> {
    constructor(props: NavigatorProps) {
        super(props);
        this.state = this.parseHash();
        window.addEventListener('hashchange', () => {
          this.setState(this.parseHash());
        });
    }
    parseHash(): NavigationState {
        var split = location.hash.split('?');

        var normalizedHash = (split[0] || '').toLowerCase();
        if (normalizedHash == '') normalizedHash = '#';

        var path = normalizedHash.split('/');

        var query: {[key: string]: string | boolean} = {};
        if(split.length > 1) {
          var querySplit = split[1].split('&');
          querySplit.forEach((param: string) => {
            var paramSplit = param.split('=');
            var value: any = true;
            if(paramSplit.length > 1) {
              value = paramSplit[1];
            }
            query[paramSplit[0]] = value;
          });
        }
        var isSelected = path[0] == this.props.hash;
        var state = { isSelected: isSelected, path: path, query: query };
        return state;
    }
    render() {
        return (<div>Navigator Base is an abstract class.You must implement your own render().</div>);
    }
}


export class NavigationView extends NavigationBase {
    render() {
        var style = {
            zIndex: this.state.isSelected ? 0 : -1,
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
