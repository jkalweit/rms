/// <reference path="./typings/tsd.d.ts" />

import Sync = require('./SyncNode');
import React = require('react/addons');


export interface SmartInputProps {
  className?: string;
  onSave?(value: string): boolean;
  model: Sync.ISyncNode;
  modelProp: string;
  isNumber?: boolean;
  isMultiline?: boolean;
}
export interface SmartInputState {
  value: string;
}
export class SmartInput extends React.Component<SmartInputProps, SmartInputState> {
  constructor(props: SmartInputProps) {
    super(props);
    this.state = {
      value: props.model[props.modelProp]
    };
  }
  componentWillReceiveProps(props: SmartInputProps) {
    this.setState({value: props.model[props.modelProp]});
  }
  save(value: string) {
    var shouldSave = true;
    if(this.props.onSave) {
      shouldSave = this.props.onSave(value);
    }
    if(shouldSave) {
      var val: any = value;
      if(this.props.isNumber) {
        val = parseFloat(val);
        console.log('converting to number', value, val);
      }
      this.props.model.set(this.props.modelProp, val);
    }
  }
  render() {

    if(this.props.isMultiline) {

      var numLines = this.state.value ? this.state.value.split(/\r\n|\r|\n/).length : 1;

      return (
            <textarea rows={numLines} className={this.props.className} type="text" value={this.state.value}
            onClick={(e: React.MouseEvent) => { e.stopPropagation(); }}
            onChange={(e: React.KeyboardEvent) => { this.setState({value: (e.target as HTMLInputElement).value}); }}
            onBlur={(e: React.FocusEvent) => { this.save((e.target as HTMLInputElement).value); }} />
        );

    } else {

      return (
            <input className={this.props.className} type="text" value={this.state.value}
            onClick={(e: React.MouseEvent) => { e.stopPropagation(); (e.target as HTMLInputElement).select(); }}
            onChange={(e: React.KeyboardEvent) => { this.setState({value: (e.target as HTMLInputElement).value}); }}
            onBlur={(e: React.FocusEvent) => { this.save((e.target as HTMLInputElement).value); }} />
        );
    }
  }
}
