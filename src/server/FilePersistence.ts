/// <reference path='./typings/tsd.d.ts' />

import fs = require('fs');
import path = require('path');
import models = require('./app/models');

export class FilePersistence<T extends models.DbObjectModel> {
    collectionName: string;
    collection: any;
    dataDirectory: string;
    constructor(collectionName: string, dataDirectory: string = 'data') {
        this.collectionName = collectionName;
        this.dataDirectory = dataDirectory;
        this.collection = {};


        var path = this.buildFilePath();
        fs.readFile(path, 'utf8', (err, data) => {
            if (err) {
                if (err.code === 'ENOENT') {
                    this.persist();
                } else {
                    console.error('Failed to read ' + path + ': ' + err);
                }
            } else {
                this.collection = JSON.parse(data);
            }
        });
    }


    query(): T[] {
        var result: T[] = [];
        for (var id in this.collection) {
            result.push(this.collection[id]);
        }
        //console.log('Queryed: ' + JSON.stringify(result));
        return result;
    }

    guid(): string {
        function s4() {
            return Math.floor((1 + Math.random()) * 0x10000)
                .toString(16)
                .substring(1);
        }
        return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
    }

    insert(data: T) : T {
        return this.update(data);
    }
    update(data: T) : T {
        if (!data._id) {
            data._id = this.guid();
        }
        if (!data.created) {
            data.created = new Date();
        }
        data.lastModified = new Date();

        //console.log('Upserting: ' + data);
        this.collection[data._id] = data;
        this.persist();
        return data;
    }
    remove(id: string) {
        delete this.collection[id];
        this.persist();
    }


    buildFilePath(): string {
        return path.join(this.dataDirectory, this.collectionName + '.json');
    }

    persist() {
        var path = this.buildFilePath();

        fs.mkdir(this.dataDirectory, null, (err) => {
            if (err) {
                // ignore the error if the folder already exists
                if (err.code != 'EEXIST') {
                    console.error('Failed to create folder ' + this.dataDirectory + ': ' + err);
                    return;
                }
            }

            fs.writeFile(path, JSON.stringify(this.collection), (err) => {
                if (err) {
                    console.error('Failed to write ' + path + ': ' + err);
                }
            });
        });
    }
}
