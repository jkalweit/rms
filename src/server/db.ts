import models = require('./app/models');
import mongodb = require('mongodb');
var ObjectId = mongodb.ObjectID;


var server = new mongodb.Server('localhost', 27017, { auto_reconnect: true })
export var db = new mongodb.Db('rms', server, { w: 1 });
db.open(function() { });

export interface SortOptions {
  get?: any;
}

export function get<T extends models.DbObjectModel>(collectionName: string, filter: any, sort: SortOptions, callback: (items: T[]) => void) {
   console.log('Here1 ' + collectionName);
    db.collection(collectionName, function(error, collection) {
        console.log('Here2');
        if (error) { console.error(error); return; }
        collection.find().toArray(function(error, objs) {
            console.log('Here3');
            if (error) { console.error(error); return; }
            callback(objs);
        });
    });
}

export function getById<T extends models.DbObjectModel>(collectionName: string, id: string, callback: (items: T[]) => void) {
    get(collectionName, { id: new ObjectId(id) }, {}, callback);
}

export function exists(collectionName: string, id: string, callback: (exists: boolean) => void) {
    get(collectionName, { id: new ObjectId(id) }, {}, (items: any[]) => {
          return items.length > 0;
      });
}

export function insert<T extends models.DbObjectModel>(collection: string, item: T, callback: (result: any, item: T) => void) {
  console.log('Here1');
    db.collection(collection, function(error, items) {
      console.log('Here2');
        if (error) { console.error(error); return; }
        item.created = new Date();
        item.lastModified = item.created;
        items.insert(
            item,
            function(error, result) {
              console.log('Here3');
                if (error) { console.error(error); return; }
                callback(result, item);
            }
        );
    });
}


export function patch<T extends models.DbObjectModel>(collection: string, item: T, callback: (result: any, item: T) => void) {
    db.collection(collection, function(error, items) {
        if (error) { console.error(error); return; }
        var _id = new ObjectId(item._id);
        delete item._id; // _id is immutable, so don't include in $set
        delete item.created; // don't try to update created
        delete item.lastModified; // don't try to update lastModified, it is done by $currentDate
        items.update(
            { "_id": _id },
            {
                "$set": item,
                "$currentDate": {
                    lastModified: true
                }
            },
            function(error, result) {
                if (error) { console.error(error); return; }
                items.findOne({ "_id": _id }, function(error, current) {
                  callback(result, current);
              });
            }
        );
    });
}


export function remove(collection: string, id: string, callback: (result: any, id: string) => void) {
    db.collection(collection, function(error, items) {
        if (error) { console.error(error); return; }
        items.remove(
            { "_id": new ObjectId(id) },
            { single: true },
            function(error, result) {
                if (error) { console.error(error); return; }
                callback(result, id);
            }
        );
    });
}
