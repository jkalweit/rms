/// <reference path='./typings/tsd.d.ts' />


export interface LogItem {
  stamp?: string;
  path?: string;
  message?: string;
  type?: string;
}

class Logger {
  items: LogItem[];
  listeners: any[];
  constructor() {
    this.items = [];
    this.listeners = [];
  }
  onItemsChanged(callback: (items: LogItem[]) => void) {
    this.listeners.push(callback);
  }
  debug(path: string, message: string) {
    this.log(path, message, 'debug');
  }
  error(path: string, message: string) {
    this.log(path, message, 'error');
  }
  log(path: string, message: string, type: string = 'log') {
    var newItem = { stamp: new Date().toLocaleString(), path: path, message: message, type: type } as LogItem;
    this.items = [newItem].concat(this.items); //Use concat to make a new array and avoid changing immutable state
    this.listeners.forEach((callback: (items: LogItem[]) => void) => {
      callback(this.items);
    });
  }
}

export var Log = new Logger();
