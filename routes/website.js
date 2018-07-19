var SQL = require('sql-template-strings');
var express = require('express');
var app = express.Router();
var assert = require('chai').assert;
var sanitizer = require('sanitizer');


// Custom modules
var log = require('../tools/logger.js');
var routelog = require('../tools/routelog.js');
var utils = require('../tools/utils.js');
var query = require('../data/query.js');
var readCacheFile = require('../data/readCacheFile.js');
var crypt = require('../tools/encryption.js');
var hash = require('../tools/hashing.js');




// Construct an instance for each collection of queries.
// Purpose is to know when all async callbacks are done by keeping a count.
// The response body is also collected here, and the last callback to run,
// or the first callback to error will send the response.
// Order of execution is never guaranteed with Async callbacks.
function CallbackCollector(totalQueryAmount, req, res) {
    // Ensure the constructor is called with a value:
    assert(totalQueryAmount != undefined, 'Send query amount in constructor.');
    var query_count = totalQueryAmount;
    var status = 1;  // any error will change this and affect all.
    var reason = '';  // append any error messages in any query.
    var data = {};  // append to this object sometimes
    var blockAllNext = false;
    var req = req;
    var req = res;

    this.sendStatus = function(status_i, reason_i) {
        // Any failure status of 0 will persist. 1 otherwise.
        status = (status_i === 0) ? status_i : status;

        // Update count of queries remaining;
        query_count--;

        // Append to 'reason'..
        reason += reason_i;

        return this;  // for chaining.
    }

    this.addData = function(key, value) {
        data[key] = value;
        return this;  // for chaining.
    }

    this.enqueue = function() {
        // Send on first error, or if all done.
        if (!blockAllNext) {
            // Send if 
            if (query_count == 0 || status === 0) {
                // Block all other future queries.
                blockAllNext = true;
                // Send response.
                return res.json(data);  // stringifies and sets application/json header.
            }
        }
        return this;  // for chaining.
    }
}

// test the above structure. it works.
app.get('/test/', function (req, res) {
    routelog(req, res);

    // construct for a collection of queries.
    var cc = new CallbackCollector(3, req, res);

    query(`select * from users;`, function(err, result) {
        if (err) {  // details contained in err.error
            console.error('error running query', err);
            cc.sendStatus(0, 'Sorry, database error :(');
            return err;  // Guard/block anything below from running.
        } else {
            cc.sendStatus(1, '').addData('what', 222).enqueue();
        }
    });
    query(`select * from shift;`, function(err, result) {
        if (err) {  // details contained in err.error
            console.error('error running query', err);
            cc.sendStatus(0, 'Sorry, database error :(');
            return err;  // Guard/block anything below from running.
        } else {
            cc.sendStatus(1, '').addData('omg', 'idk').enqueue();
        }
    });
    query(`select * from login;`, function(err, result) {
        if (err) {  // details contained in err.error
            console.error('error running query', err);
            cc.sendStatus(0, 'Sorry, database error :(');
            return err;  // Guard/block anything below from running.
        } else {
            cc.sendStatus(1, '').addData('lets', 'see what happens.').enqueue();
        }
    }); 
});















// Routes
// =============================================================================
// TODO: separate into different router dir/file.
// TODO: handle the route strings more efficiently and secure, and refactor.
// TOOD: bind to controller stuff


// http://localhost:3000/
app.get('/', function (req, res) {
    // res.send('Hello World!');
    routelog(req, res);
    if (utils.isLoggedIn(req.sessionState)) {
        // Check if has admin token/status/credential,
        // Send admin page if login credentials are for an admin.
        if (req.sessionState.isAdmin) {
            res.redirect('admin');
        } else {
            res.redirect('profile');
        }
    } else {
        res.redirect('login');  // Login if not authenticated..
    }
});



// http://localhost:3000/admin/
app.get('^/admin/?$', function (req, res) {
    routelog(req, res);

    console.log('req.sessionState.username:', _username(req));
    console.log('req.sessionState.expires:', req.sessionState.expires);

    if (utils.isLoggedIn(req.sessionState)) {
        
        // Check if has admin token/status/credential
        if (!req.sessionState.isAdmin) {
            res.redirect('login');   
        }

        res.render('admin', {
            title: 'Admin'
        });
    } else {
        res.redirect('login');
    }
});



// http://localhost:3000/login/
app.get('^/login/?$', function (req, res) {
    routelog(req, res);

    // console.log('req.sessionState.username:', req.sessionState.username);
    // console.log('req.sessionState.expires:', req.sessionState.expires);

    res.render('login', {
        title: 'Login'
    });
});



// http://localhost:3000/logout/
app.get('^/logout/?$', function (req, res) {
    routelog(req, res);

    // To terminate the session, use the reset function on the session cookie.
    // It invalidates the hashed cookie token(s) on the client, which was used to authenticate on the server.
    req.sessionState.reset();  // set

    res.redirect('login');
});


// http://localhost:3000/profile/
app.get('^/profile/?$', function (req, res) {
    routelog(req, res);

    console.log('req.sessionState.username:', _username(req));
    console.log('req.sessionState.expires:', req.sessionState.expires);
    // console.log('isLoggedIn:', utils.isLoggedIn(req.sessionState));
    // console.log('isLoggedIn:', utils.isLoggedIn(req.sessionState));

    if (utils.isLoggedIn(req.sessionState)) {
        // Get user details

        // Pre-fill the html with content before sending (rendering) to client.
        var q = SQL`SELECT workname, position
                FROM users
                JOIN employee USING(uID)
                JOIN job USING(jobID)
                WHERE username=${_username(req)}`;  // security hole??

        query(q, function(err, result) {
            if (err) {  // details contained in err.error
                console.error('error running query', err);
                return err;  // Guard/block anything below from running.
            }

            var entry = result.rows;
            var workplaces = '';
            var shiftpositions = '';
            var shiftErrorMessage = '';

            // console.log(entry);
            if (entry.length) {  // not empty.
                var item = entry[0];

                var tempW = [];
                var tempP = [];
                for (i in entry) {
                    var w = entry[i].workname;
                    var p = entry[i].position;  // TODO: bind to workname so user can click on workname and the dropdown of available positions comes.. liek my 343 assignment.
                    
                    if (tempW.indexOf(w) === -1) {  // uniqueness.
                        workplaces += '<option value="' + w + '">' + w + '</option>\n';
                    }
                    tempW.push(w);
                    if (tempP.indexOf(p) === -1) {  // uniqueness.
                        shiftpositions += '<option value="' + p + '">' + p + '</option>\n';
                    }
                    tempP.push(p);
                }
                // console.log(workplaces, shiftpositions);
                if (!tempW.length || !tempP.length) {
                    shiftErrorMessage = 'Workplaces or positions are unavailable. You must have a job first.'
                }
                
            }

            // workplaces is set in the shifter.
            res.render('profile', {
                title: "Shifter!",
                workplaces: workplaces,
                shiftpositions: shiftpositions,
                shiftErrors: shiftErrorMessage

            });
        });

    } else {
        res.redirect('login');
    }
});



// http://localhost:3000/messages/
app.get('^/messages/?$', function (req, res) {
    routelog(req, res);

    // TODO: database query for this, like in endpoint: /profile/
    var workplaces = `<option value="Dummy Data">Dummy Data</option>
                        <option value="Oneils Pub">Oneils Pub</option>
                        <option value="Club Monaco">Club Monaco</option>`;

    var shiftpositions = `<option value="Dummy Data">Dummy Data</option>
                        <option value="Waiter">Waiter</option>`;

    res.render('messages', {
        title: 'Messages',
        workplaces: workplaces,
        shiftpositions: shiftpositions,
        shiftErrors: 'This is just dummy data!'
    });
});


// Note 'username' is not the user's name. it is an implementation detail that
// uniquely defines the user in the database, and is used as an auth token, etc.
function _username(req) {
    return req.sessionState.username || '';
}


module.exports = app;
