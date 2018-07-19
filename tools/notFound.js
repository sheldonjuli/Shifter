
/* Error code to make the error handler handle 404 status.
 * The middleware detects this error and sends 404 to client.
 * Currently unused in our app! (TODO: delete if never used)
 * import like: var notFound = require('../tools/notFound.js');
 * ..and call like: notFound(req, res, next);  // 404
 */
module.exports = function notFound(req, res, next) {
    var err = new Error();
    err.status = 404;
    next(err);
}

