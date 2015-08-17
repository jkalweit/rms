/// <reference path='./typings/tsd.d.ts' />
var fs = require('fs');
var path = require('path');
var FilePersistence = (function () {
    function FilePersistence(filename, directory) {
        if (directory === void 0) { directory = 'data'; }
        this.filename = filename;
        this.directory = directory;
    }
    FilePersistence.prototype.get = function () {
        var path = this.buildFilePath();
        fs.readFile(path, 'utf8', function (err, data) {
            if (err) {
                if (err.code === 'ENOENT') {
                    return null;
                }
                else {
                    console.error('Failed to read ' + path + ': ' + err);
                }
            }
            else {
                return JSON.parse(data);
            }
        });
    };
    FilePersistence.prototype.persist = function (data) {
        var _this = this;
        var path = this.buildFilePath();
        fs.mkdir(this.directory, null, function (err) {
            if (err) {
                if (err.code != 'EEXIST') {
                    console.error('Failed to create folder ' + _this.directory + ': ' + err);
                    return;
                }
            }
            fs.writeFile(path, JSON.stringify(data), function (err) {
                if (err) {
                    console.error('Failed to write ' + path + ': ' + err);
                }
            });
        });
    };
    FilePersistence.prototype.buildFilePath = function () {
        return path.join(this.directory, this.filename + '.json');
    };
    return FilePersistence;
})();
exports.FilePersistence = FilePersistence;
//# sourceMappingURL=FilePersistence.js.map