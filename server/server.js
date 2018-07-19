'use strict';

// Node modules.
// =============================================================================
var express = require('express');
var path = require('path');
var expressValidator = require('express-validator');
var ejs = require('ejs');
var bodyParser = require('body-parser');
var sessions = require("client-sessions");

// Custom modules.
// =============================================================================
var log = require('../tools/logger.js');
var routelog = require('../tools/routelog.js');
// var DataManager = require('../models/DataManager.js');
var query = require('../data/query.js');
var readCacheFile = require('../data/readCacheFile.js');

// Setup
// =============================================================================
// website and api endpoints
var app = express();

// Set name of app.
app.locals.title = 'Shifter';

// Disable 'x-powered-by' in header so attackers cant see we use express, and 
// launch specific attacks.
app.disable('x-powered-by');

// Define location of index file.
var PORT = process.env.PORT || 3000;  // requirement: port 3000
var LOCALHOST = '127.0.0.1';

// Use path.join() since we traverse up a dir in middle of path.
var ASSETS_LOCATION = path.join(__dirname, '../assets_public');


// Open a socket stream, and listen on a port.
// =============================================================================
// Routes: map URL to controller, based upon external input such as GET or POST variables.
// req for Request is instance of http.IncomingMessage.
// https://nodejs.org/api/http.html#http_class_http_incomingmessage
// res for Response is instance of http.ServerResponse
// https://nodejs.org/api/http.html#http_class_http_serverresponse
app.listen(PORT, function () {
    // Output 'success message' to node server terminal stdout stream.
    console.log('✨ Server running at http://127.0.0.1:'+PORT+'/ aka http://localhost:'+PORT+'/');
});


// =============================================================================
// Other Middleware
// =============================================================================

// Serve public files (define directory location)
// =============================================================================
// https://expressjs.com/en/starter/static-files.html
// https://github.com/expressjs/serve-static
// e.g. enables routes like: http://localhost:3000/scripts/script.js
app.use(express.static(ASSETS_LOCATION));


// Templates
// =============================================================================
// You can use the method set() to redefine express's default 'view' location setting.
// Views is "a directory or an array of directories for the application's views. If an array, the views are looked up in the order they occur in the array."
app.set('view engine', 'ejs');  // set the view engine to ejs
app.set('views', ASSETS_LOCATION + '/views');

// change rendering engine to look for views ending in '.html' and then 
// using the ejs engine on it.
app.engine('.html', ejs.__express);
app.set('view engine', 'html');

// Define parser for the body of POST requests, for receiving json objects.
// https://github.com/expressjs/body-parser#bodyparserurlencodedoptions
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());


// Auth: Sessions
// =============================================================================
// 'secret' should be a large unguessable string. note that changing this 
// logs out all users.
// the master secret is used for the Transport Layer Security.
app.use(sessions({
    cookieName: 'sessionState', // cookie name dictates the key name added to the request object
    secret: 'vbbu67kXrC3AUQmqgDh0zUNwrbT2IimmZlZNL1dwh5U=',
    duration: 24 * 60 * 60 * 1000, // how long the session will stay valid in ms
    activeDuration: 1000 * 60 * 5 // if expiresIn < activeDuration, the session will be extended by activeDuration milliseconds
}));


// =================================================================
// Routes
// =================================================================
// website endpoints
app.use(require('../routes/website.js'));

// api endpoints for json
app.use(require('../routes/api.js'));

// For anything else not matched to the endpoints above in the control flow.
// Will be handled by error middleware.
app.use(function(req, res, next) {
    var err = new Error();
    err.status = 404;
    return next(err);
});


// Error Middleware: Status Codes
// =============================================================================
// Error middleware has err, req, res and next
// Make sure to put error handlers after all routes, which are evaluated in order.
// http://expressjs.com/en/guide/error-handling.html

// Configure environment
// TODO: make this work?
var env = process.env.NODE_ENV || 'development'; // default to dev.
if (env == 'development') {
    // showStack..
} else { // prod.
    // hide stuff
    // no stacktraces leaked to user
}


// For handling all errors.
// TODO: refactor repeated code.
app.use(function(err, req, res, next) {
    
    // Handling 500
    if (err.status === 500) {
        // TODO: log these 500 errors.
        console.error(err.stack);
        var url = req.url;
        if (url.indexOf('/api/') === 0) {  // api
            console.error('[500 api]', url);
            res.status(500).json({status:500, reason: 'sorry server error'});
        } else {  // website
            console.error('[500 website]', url);
            res.status(500).render('error', {
                errorStatusCode: 500,
                errorMessage: 'sorry, server error.'
            });
        }
    } 
    // Handling 404
    else if  (err.status === 404) {
        // TODO: log these 404 errors.
        var url = req.url;
        if (url.indexOf('/api/') === 0) {  // api
            console.error('[404 api]', url);
            res.status(404).json({status:404, reason: 'sorry cant find: ' + url});
        } else {  // website
            console.error('[404 website]', url);
            res.status(404).render('error', {
                errorStatusCode: 404,
                errorMessage: 'The requested URL "' + url + '" was not found on this server. That’s all we know.'
            });
        }
    } else {
        console.error('Unhandled error status code:', err);
    }
});



// TODO: add handler for status code "403 Forbidden", unauthorized..


// var hash = require('../tools/hashing.js');
// console.log(hash.hash('somuchmorefun'));
