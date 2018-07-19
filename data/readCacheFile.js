var path = require('path');
var fs = require('fs');

// I/O is synchronous and costly, so we must cache it!
var sqlFileCache = {};

// synchronous request will block the entire application.
// Performing synchronous tasks before your server(s) start listening is fine because you're not blocking requests at that point.
// Use path.join() since we traverse up a dir in middle of path.
// Note pg prepared statements cannot take more than 1 parameter!
module.exports = function (filename, options) {
    var content = "";
    if (sqlFileCache[filename]) {
        content = sqlFileCache[filename];
    } else {
        console.log("Running Query: ", path.join(__dirname, filename));
        content = fs.readFileSync(path.join(__dirname, filename), "utf-8");
        sqlFileCache[filename] = content;
    }
    return content;
}

