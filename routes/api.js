'use strict';

var SQL = require('sql-template-strings');
var express = require('express');
var app = express.Router();
var assert = require('chai').assert;
var sanitizer = require('sanitizer');  // Uses Google Caja's HTML Sanitizer.

// Custom modules
var log = require('../tools/logger.js');
var routelog = require('../tools/routelog.js');
var utils = require('../tools/utils.js');
var query = require('../data/query.js');
var readCacheFile = require('../data/readCacheFile.js');
var crypt = require('../tools/encryption.js');
var hash = require('../tools/hashing.js');



// Testing postgre queries
// ========================================================================

// var content = readCacheFile('../data/q1.sql');
// // console.log(content);

// query({
//     name: "emp_name", 
//     text: readCacheFile('../data/q1.sql'),
//     values:[123]
// }, function(err, result) {

//     if (err) {  // details contained in err.error
//         console.error('error running query', err);
//         return err;  // Guard/block anything below from running.
//     }

//     // console.log(result.rows[0].number);  // output: 123
//     console.log(result.rows);

// });



// query(readCacheFile('../data/q1.sql'), [], function(err, result) {
//     if (err) {  // details contained in err.error
//         console.error('error running query', err);
//         return err;  // Guard/block anything below from running.
//     }
//     console.log(result.rows);
// });




// var reason = '';
// var status = 1;

// var q = ``;

// query(q, function(err, result) {
//     if (err) {  // details contained in err.error
//         console.error('error running query', err);
//         data['reason'] = 'Sorry, database error XXXXX :(';
//         data['status'] = 0;
//         res.json(data);
//         return err;  // Guard/block anything below from running.
//     }

//     var entry = result.rows;
//     // console.log(entry);
//     if (entry.length) {  // not empty.
//         var item = entry[0];
        
//     }
//     else {
//         reason += 'Database item ZZZZZZZZ not found. ';
//         status = 0;
//     }
//     data['status'] = status;
//     data['reason'] = reason;
//     res.json(data);  // stringifies and sets application/json header.
// });




// ========================================================================


// Helper function to parse the urlEncoded body into a javascript object.
// UPDATE: is not used anymore because the client no longer sends the post body
// as JSON.stringify()... 
function parseBody(body) {
    // return JSON.parse(Object.keys(body)[0]);
    return body;
}



/*
curl http://localhost:3000/api/user/add/ -i -X POST -H "Content-Type: application/json" -d '{
"type": "admin",
"originator": "a1",
"email": "test@aol.com",
"username": "newuser123",
"password": "<HASH_password>",
"firstName": "Tooky",
"middleName": "Tee",
"lastName": "McTook",
"workplaces": [
    {
        "name": "The Patio 23",
        "address": "43 Glenbarry St.\nToronto, ON, M8H2JT\nCanada"
    },
    {
        "name": "Oneils Pub", 
        "address": "22 Someother Avenue\nToronto, ON, M6J2TK\nCanada"
    }
]
}'
*/
app.post('^/api/user/add/$', function (req, res, next) {
    routelog(req, res);
    
    // Capture post body fields:
    // Determine the type of actions can take.
    var body = parseBody(req.body);
    var newUserType = sanitizer.escape(body.type);
    var originatorId = sanitizer.escape(body.originator);  // note this would really be hashed.
    var username = sanitizer.escape(body.username);  // not hashed.
    var password = sanitizer.escape(body.password);
    var firstName = sanitizer.escape(body.firstName);
    var middleName = sanitizer.escape(body.middleName);
    var lastName = sanitizer.escape(body.lastName);
    var workplaces = sanitizer.escape(body.workplaces);  // list. only for admin originatorId.
    var email = sanitizer.escape(body.email);

    // TODO: DB query user
    // check if username/password found in db.

    // Dummy data shifter/worker
    var data = {};
    var status = 1;  // default is failure status.
    var reason = "";


    // Only admin can add: admin or manager
    // admin is superuser, can do anything!
    // [note: only admin can add managers.]
    if (originatorId === 'a1') {
        // do database operation
        // TODO: if after database operations everything is fine, then set status = 1.

        // can we add new admins on the admin panel?

    } 
    // otherwise workers can only add workers.
    else if (originatorId === 's1') {
        // do database operation
        // TODO: if after database operations everything is fine, then set status = 1.

    } else {
        status = 0;
        reason += originatorId + ' users cannot add ' + newUserType + ' users. ';
    }

    if (password === '') {
        status = 0;
        reason += 'Invalid pass. ';
    }

    if (username === '') {
        status = 0;
        reason += 'Invalid pass. ';
    }


    data['status'] = status;
    data['reason'] = reason;

    res.json(data);  // json stringifies and sets application/json header.
});




app.get('^/api/user/:userId$', function (req, res, next) {
    routelog(req, res, true);
    
    // var foundUser = (req.params.userId === 's1' || req.params.userId === 'm1') ? 1 : 0;
    var foundUser = 1;
    var validUriParam = true;
    var data = {};
    var userId = '';
    var reason = '';

    try {
        userId = crypt.decrypt(sanitizer.escape(req.params.userId));
    } catch (e) {
        if (e instanceof TypeError) {  // catch only this specific error.
            reason += 'Unrecognized URI parameter. ';
            validUriParam = false;
            console.error('Caught Error:', reason, e);
            data['reason'] = reason;
            data['status'] = 0;
            res.json(data);
            return;  // Guard/block anything below from running.

        } else {
            throw e; // let others bubble up
        }
    }


    // DB query to get data based on userId.
    // time to enter callback hell...
        
    // tested on psql in people_work_rating_isbanned.sql
    var q = SQL`-- add userStatus/banned
    SELECT *, CASE WHEN users.uid=ban.uid THEN true
            ELSE false
        END as is_banned

    -- users and their work information.
    -- need to do 'LEFT JOIN' incase user just signed up and has sparse data!!
    FROM users
    LEFT JOIN employee USING(uid)
    LEFT JOIN Job USING(jobid)
    LEFT JOIN (
        SELECT workname, 
        address || '\n' || 
        city || ', ' || 
        region || ', ' || 
        postzip || '\n' || 
        country as workplace
        FROM WorkLocation
    ) as work_address_concat
    USING(workname)

    LEFT JOIN ban  -- gets null value if not in table Ban
    USING(uid)
    LEFT JOIN (
        -- Average rating by user id, set to None (rather than 0 or 5) if doesnt exist.
        SELECT uid, coalesce(to_char(AVG(rating), '9.99'), 'None') as avg_rating
        FROM (
            -- Rating from shift posters (shift), and from shift takers (took).
            SELECT uid, email, username, shift.eventID, rating
            FROM users
            LEFT JOIN Shift ON users.uid=shift.shifterid
            LEFT JOIN Feedback USING (eventid)
            UNION
            SELECT uid, email, username, Took.eventID, rating
            FROM users
            LEFT JOIN Took ON users.uid=Took.takerID
            LEFT JOIN Feedback USING (eventid)
        ) as ratings_per_eventid
        GROUP BY uid
    ) as sdfhiusdfhsdfdsf
    USING (uid)
    where username=${userId};`;

    query(q, function(err, result) {

        if (err) {  // details contained in err.error
            console.error('error running query', err);
            data['reason'] = 'Sorry, database error finding user info :(';
            data['status'] = 0;
            res.json(data);
            return err;  // Guard/block anything below from running.
        }

        var entry = result.rows;
        // console.log(entry);

        if (!entry.length) {  // wrong login details.
            data['reason'] = 'User not found.';
            data['status'] = 0;
            res.json(data);
            return err;  // Guard/block anything below from running.
        }

        var workplaces = [];
        var coworkers = [];

        var item = entry[0];
        data['userId'] = sanitizer.escape(req.params.userId);
        data['firstName'] = item.firstname;
        data['middleName'] = item.middlename;
        data['lastName'] = item.lastname;
        data['rating'] = item.avg_rating;
        data['email'] = item.email;
        data['userStatus'] = (item.is_banned === false) ? 1 : 0;

        for (var i in entry) {
            workplaces.push({
                name: entry[i].workname,
                address: entry[i].workplace
            })
        }
        data['workplaces'] = workplaces;


        // Need to do a subquery for 'coworkers' because we cannot join or
        // union it with the workplace/user details query above.

        var coworkersQ = SQL`-- coalesce to turn null (num_taken) into 0.
            SELECT job.workname, coworkers.firstname, coworkers.middlename, 
            coworkers.lastname, coworkers.username as coworker_username, 
            coworkers.uid as coworker_uid, average_info.avg_rating, 
            coalesce(num_taken, 0) as num_shifts_taken

            -- , uid=banned_id as is_banned
            FROM users u1
            JOIN employee USING(uid)
            JOIN job USING(jobid)

            JOIN (
                SELECT firstname, middlename, lastname, username, uid, workname
                FROM users u2
                JOIN employee e2 USING(uid)
                JOIN job j2 USING(jobid)
            ) as coworkers
            USING(workname)

            -- get average rating of each coworker. [note: '9.99' is the precision spec]
            JOIN (
                SELECT uid, coalesce(to_char(AVG(rating), '9.99'), 'None') as avg_rating
                FROM (
                    -- Rating from shift posters (shift), and from shift takers (took).
                    SELECT uid, email, username, shift.eventID, rating
                    FROM users
                    LEFT JOIN Shift ON users.uid=shift.shifterid
                    LEFT JOIN Feedback USING (eventid)
                    UNION
                    SELECT uid, email, username, Took.eventID, rating
                    FROM users
                    LEFT JOIN Took ON users.uid=Took.takerID
                    LEFT JOIN Feedback USING (eventid)
                ) as ratings_per_eventid
                GROUP BY uid
            ) as average_info
            ON coworkers.uid = average_info.uid

            -- number of shifts taken by each coworker.
            LEFT JOIN (
                SELECT takerID, count(takerID) as num_taken
                FROM Took
                GROUP BY takerID
            ) as coworkers_num_taken
            ON coworkers_num_taken.takerid = coworkers.uid


            WHERE u1.username=${userId}
            AND u1.username != coworkers.username;  -- prevent samesies.`;

        query(coworkersQ, function(err, result) {
            if (err) {  // details contained in err.error
                console.error('error running query', err);
                data['reason'] = 'Sorry, database error finding coworkers :(';
                data['status'] = 0;
                res.json(data);
                return err;  // Guard/block anything below from running.
            }

            var entry_nested = result.rows;
            // console.log(entry_nested);

            if (entry_nested.length) {  // found stuff
                for (var i in entry_nested) {
                    coworkers.push({
                        workname: entry_nested[i].workname,
                        firstName: entry_nested[i].firstname,
                        middleName: entry_nested[i].middlename,
                        lastName: entry_nested[i].lastname,
                        userId: crypt.encrypt(entry_nested[i].coworker_username),
                        avgRate: entry_nested[i].avg_rating,
                        shiftsTaken: entry_nested[i].num_shifts_taken
                    })
                }
            }

            data['status'] = foundUser;
            data['reason'] = reason;
            data['coworkers'] = coworkers;
            res.json(data);  // stringifies and sets application/json header.
        });

    });
});



function isDefined(input) {
    // REQ all inputs are strings.
    // Trim the string. to compare with '' later.
    // We don't mind the duck-type returns since js has !'' === !undefined
    return (input === undefined) ? input : input.trim();
}


// User update the info on their page.
// Admin update other user's info.
app.post('^/api/user/:userId$', function (req, res, next) {
    routelog(req, res, true);

    var status = 1;
    var userId = '';
    var reason = '';
    var data = {};

    try {
        userId = crypt.decrypt(sanitizer.escape(req.params.userId));
    } catch (e) {
        if (e instanceof TypeError) {  // catch only this specific error.
            console.error('Caught Error:', reason, e);
            data['status'] = 0;
            data['reason'] = 'Unrecognized URI parameter. ';
            res.json(data);
            return;  // Guard.
        } else {
            throw e; // let others bubble up
        }
    }

    // Guard.
    // must be logged in.
    if (!utils.isLoggedIn(req.sessionState)) {
        data['status'] = 0;
        data['reason'] = 'User must be logged in to make changes';
        res.json(data);
        return;  // Guard.
    }

    // Can do anything if has admin token/status/credential.
    // Otherwise the usernames of user must match.
    if (!req.sessionState.isAdmin && req.sessionState.username != userId) {
        data['status'] = 0;
        data['reason'] = 'Insufficient privileges.';
        res.json(data);
        return;  // Guard.
    }


    var body = parseBody(req.body);
    // console.log(body);
    var originatorId = sanitizer.escape(body.originator);  // hashed.
    // var newUsername = sanitizer.escape(body.username);  // should not be hashed. but its getting sent hashed so just ignore for now.
    var password = sanitizer.escape(body.password);
    var firstName = sanitizer.escape(body.firstName);
    var middleName = sanitizer.escape(body.middleName);
    var lastName = sanitizer.escape(body.lastName);
    // var workplaces = sanitizer.escape(body.workplaces);  // list. only for admin originatorId.
    var email = sanitizer.escape(body.email);
    var userStatus = sanitizer.escape(body.userStatus);  // only admin can ban/unban users

    // Other guards
    if (password.length < 8) {
        data['status'] = 0;
        data['reason'] = 'Password too short. ';
        res.json(data);
        return;  // Guard.
    }

    // Do DB stuff
    var buildQuery = '';

    // if (isDefined(newUsername)) {
    //     buildQuery += `UPDATE users
    //                     SET username = '` + newUsername + `'
    //                     WHERE username = '` + userId + `';
    //                     `;
    // }

    if (isDefined(password)) {
        buildQuery += `UPDATE Login
                        SET passHash = '` + hash.hash(password) + `'
                        WHERE EXISTS (
                            SELECT *
                            FROM users
                            WHERE login.uid=users.uid
                            AND username = '` + userId + `'
                        );
                        `;
    }

    if (isDefined(firstName)) {
        // console.log('change firstname to', firstName, 'for userId', userId);
        buildQuery += `UPDATE users
                        SET firstname = '` + firstName + `'
                        WHERE username = '` + userId + `';
                        `;
    }

    if (isDefined(middleName)) {
        buildQuery += `UPDATE users
                        SET middleName = '` + middleName + `'
                        WHERE username = '` + userId + `';
                        `;
    }

    if (isDefined(lastName)) {
        buildQuery += `UPDATE users
                        SET lastName = '` + lastName + `'
                        WHERE username = '` + userId + `';
                        `;
    }

    // TODO: validate format
    if (isDefined(email)) {
        buildQuery += `UPDATE users
                        SET email = '` + email + `'
                        WHERE username = '` + userId + `';
                        `;
    }

    // Check again since only admin can ban/unban users.
    // TODO: test handling 0/1 in the condition check
    if (isDefined(userStatus) && req.sessionState.isAdmin) {
        // buildQuery += ``;
        // Delete/Insert with the Ban table...
    }

    query(buildQuery, function(err, result) {
        if (err) {  // details contained in err.error
            console.error('error running query', err);
            data['reason'] = 'Sorry, database error updating user info :(';
            data['status'] = 0;
            res.json(data);
            return err;  // Guard/block anything below from running.
        }

        data['status'] = status;
        data['reason'] = reason;
        res.json(data);  // stringifies and sets application/json header.
    });

});




// currently, only admin can delete users.
app.delete('^/api/user/:userId$', function (req, res, next) {
    routelog(req, res, true);
    // TODO: DB query to get data based on different userId
    // var found = req.params.userId === 's1' || req.params.userId === 'm1' || req.params.userId === 'a1';

    var data = {};
    var reason = '';
    var status = 1;
    var userId = '';

    try {
        userId = crypt.decrypt(sanitizer.escape(req.params.userId));
    } catch (e) {
        if (e instanceof TypeError) {  // catch only this specific error.
            reason += 'Unrecognized URI parameter. ';
            console.error('Caught Error:', reason, e);
            status = 0;
        } else {
            throw e; // let others bubble up
        }
    }

    // Check if has admin token/status/credential.
    if (status && utils.isLoggedIn(req.sessionState) && req.sessionState.isAdmin) {
        
        // Delete user.
        // Only have to delet from Users table since it cascades to others like,
        // Login/Friends/Employee/...

        var q = `DELETE
            FROM users
            WHERE username='` + userId + `';`;

        query(q, function(err, result) {
            if (err) {  // details contained in err.error
                console.error('error running query', err);
                reason += 'Sorry, database error deleting user :(';
                status = 0;
                res.json(data);
                return err;  // Guard/block anything below from running.
            }

            // result.rows;  // always empty

            data['status'] = status;
            data['reason'] = reason;
            res.json(data);  // stringifies and sets application/json header.
        });   
    }
});




app.post('^/api/user/friend/$', function (req, res, next) {
    routelog(req, res);
    // TODO: DB query to get data based on different userId

    var body = parseBody(req.body);
    var userId = '';
    var friendId = sanitizer.escape(body.friendId);  // note this would really be hashed.

    try {
        // Note: use req.sessionState.username instead!!
        userId = req.sessionState.username;
        // TODO: need to check if utils.isLoggedIn(req.sessionState)!!
        // userId = crypt.decrypt(sanitizer.escape(body.userId));
    } catch (e) {
        if (e instanceof TypeError) {  // catch only this specific error.
            reason += 'Unrecognized User. ';
            console.error('Caught Error:', reason, e);
            validUriParam = false;
        } else {
            throw e; // let others bubble up
        }
    }


    var foundUser = userId === 's1' || userId === 'm1' || userId === 'a1';
    var foundFriend = friendId === 's1' || friendId === 'm1' || friendId === 'a1';

    // Dummy data shifter/worker
    var data = {};

    // temporary, will do actual checks later:
    data['status'] = 1;
    data['reason'] = '';
    if (!foundUser) {
        data['status'] = 0;
        data['reason'] = 'User not found.';
    }
    if (!foundFriend) {
        data['status'] = 0;
        data['reason'] = 'Friend not found.';
    }

    res.json(data);  // json stringifies and sets application/json header.
});









// Apply: the workplace/position must exist in db first.
app.post('^/api/work/add/$', function (req, res, next) {
    routelog(req, res);
    
    var data = {};
    var status = 1;
    var reason = '';

    var body = parseBody(req.body);
    var workname = sanitizer.escape(body.workname);
    var position = sanitizer.escape(body.position);
    var userId = '';
    try {
        // Note: use req.sessionState.username instead!!
        userId = req.sessionState.username;
        // TODO: need to check if utils.isLoggedIn(req.sessionState)!!
        // userId = crypt.decrypt(sanitizer.escape(body.userId));
        // console.log(userId);
        // console.log(req.sessionState);
        // console.log(utils.isLoggedIn(req.sessionState));
    } catch (e) {
        if (e instanceof TypeError) {  // catch only this specific error.
            reason += 'Unrecognized User. ';
            console.error('Caught Error:', reason, e);
            validUriParam = false;
        } else {
            throw e; // let others bubble up
        }
    }

    // console.log("Apply:", userId, workname, position);

    var q = `-- the workplace/position must exist.
        SELECT workname, position
        FROM job
        WHERE workname='`+ workname +`'
        AND position='`+ position +`'

        EXCEPT

        -- the username cannot already have that workplace/position job.
        SELECT workname, position
        FROM users
        JOIN employee USING(uid)
        JOIN job USING(jobid)
        WHERE username = '`+ userId +`';`;
    
    query(q, function(err, result) {
        if (err) {  // details contained in err.error
            console.error('error running query', err);
            data['reason'] = 'Sorry, database error XXXXX :(';
            data['status'] = 0;
            res.json(data);
            return err;  // Guard/block anything below from running.
        }

        var entry = result.rows;
        // console.log(entry);
        if (entry.length) {  // not empty. exists a workplace/position.
            // TODO: insert into Apply, Events, .... etc...
            
        }
        else {
            reason += 'Cannot apply to given workplace/position. ';
            status = 0;
        }
        data['status'] = status;
        data['reason'] = reason;
        res.json(data);  // stringifies and sets application/json header.
    });
});






// History is just all notifications
app.get('^/api/user/history/:userId$', function (req, res, next) {
    routelog(req, res, true);
    // TODO: DB query to get all history (unseen) notifications for user req.params
    // var found = req.params.userId === 's1' || req.params.userId === 'm1';

    var found = 1;  // temporary
    var validUriParam = true;
    var userId = '';
    var reason = '';
    try {
        userId = crypt.decrypt(sanitizer.escape(req.params.userId));
    } catch (e) {
        if (e instanceof TypeError) {  // catch only this specific error.
            reason += 'Unrecognized URI parameter. ';
            console.error('Caught Error:', reason, e);
            validUriParam = false;
        } else {
            throw e; // let others bubble up
        }
    }


    // figure out how many items to show.
    var amount = req.query.past;
    if (typeof(amount) === 'string') {  // ?past=3
        // console.log('string', amount);
    } else if (typeof(amount) === 'object') {  // ?past=3&past=3
        amount = amount[0];
        // console.log('object', amount);
    } else {
        // undefined. set default
        amount = 8;
    }
    amount = parseInt(amount);

    // set max
    // TODO: go a lazy loading thing instead.
    amount = (amount > 50) ? 50 : amount; 


    // Dummy data shifter/worker
    var data = {};
    var events = [];
    
    if (validUriParam) {
        // Todo: DB query




    }
    
    if (found) {
        events.push({
            type: "post",
            content: {
                workplace: "McDonalds 18882",
                position: "cook",
                start: new Date("May 21, 2016 12:00:00"),
                end: new Date("May 21, 2016 20:30:00"),
                duration: 30600000,
                description: "",
                incentive: 0,
                poster: { userId: "e909",
                    name: "Workey McWork"
                }
            },
            timestamp: new Date("May 20, 2016 10:21:11"),
            noId: "sdhf98sdhfjiosdfshduf"
        });
        events.push({
            type: "post",
            content: {
                workplace: "McDonalds 18882",
                position: "cook",
                start: new Date("May 11, 2016 12:00:00"),
                end: new Date("May 11, 2016 20:30:00"),
                duration: 30600000,
                description: "",
                incentive: 0,
                poster: { userId: "e7073249",
                    name: "Walter Disney"
                }
            },
            timestamp: new Date("May 09, 2016 10:33:08"),
            noId: "sdhf98sdhfjiosdfshduf"
        });
        events.push({
            type: "accept",
            content: { 
                workplace: "The Patio 23",
                position: "waiter",
                start: new Date("May 21, 2016 12:00:00"),
                end: new Date("May 21, 2016 20:30:00"),
                taker: { userId: "e70727",
                    name: "Sarah Birwani"
                },
                poster: { userId: "e7073249",
                    name: "Walter Disney"
                },
                manager: { userId: "e909",
                    name: "Workey McWork"
                },
            },
            timestamp: new Date("May 20, 2016 18:22:02"),
            noId: "sd98hduif987gr3hf98sd7fhuisfjdsf"
        });
        events.push({
            type: "feedback",
            content:{ 
                workplace: "The Patio 23",
                position: "waiter",
                start: new Date("May 21, 2016 12:00:00"),
                end: new Date("May 21, 2016 20:30:00"),
                taker: { userId: "e70727",
                    name: "Sarah Birwani"
                },
                poster: { userId: "e7073249",
                    name: "Walter Disney"
                },
                manager: { userId: "e909",
                    name: "Workey McWork"
                },
                comment: "",
                rating: 5,
            },
            timestamp: new Date("May 21, 2016 23:00:00"),
            noId: "sda89fy89fsdfhsdfsdfh9sduf"
        });
        events.push({
            type: "employ",
            content:{ 
                workplace: "The Patio 29",
                poster: { userId: "e7073249",
                    name: "Walter Disney"
                },
                manager: { userId: "e909",
                    name: "Workey McWork"
                },
            },
            timestamp: new Date("May 05, 2016 11:53:55"),
            noId: "90ufjqiw032t89hugefq93t27g8fh9wq"
        });

    } else if (req.params.userId === 'm1') {
        events.push({
            type: "feedback",
            content:{ 
                workplace: "The Patio 23",
                position: "waiter",
                start: new Date("May 21, 2016 12:00:00"),
                end: new Date("May 21, 2016 20:30:00"),
                taker: { userId: "e70727",
                    name: "Sarah Birwani"
                },
                poster: { userId: "e7073249",
                    name: "Walter Disney"
                },
                manager: { userId: "e909",
                    name: "Workey McWork"
                },
                comment: "",
                rating: 5,
            },
            timestamp: new Date("May 21, 2016 23:00:00"),
            noId: "sda89fy89fsdfhsdfsdfh9sduf"
        });
        events.push({
            type: "approve",
            content:{
                workplace: "The Patio 23",
                position: "waiter",
                start: new Date("May 21, 2016 12:00:00"),
                end: new Date("May 21, 2016 20:30:00"),
                duration: 30600000,
                description: "",
                incentive: 0,
                taker: { userId: "e70727",
                    name: "Sarah Birwani"
                },
                poster: { userId: "e7073249",
                    name: "Walter Disney"
                },
                manager: { userId: "e909",
                    name: "Workey McWork"
                },
            },
            timestamp: new Date("May 20, 2016 15:21:11"),
            noId: "dfshd9f8hsdiufhsdfjksdf987e"
        });
        events.push({
            type: "employ",
            content:{ 
                workplace: "The Patio 29",
                poster: { userId: "e7073249",
                    name: "Walter Disney"
                },
                manager: { userId: "e909",
                    name: "Workey McWork"
                },
            },
            timestamp: new Date("May 05, 2016 11:53:55"),
            noId: "90ufjqiw032t89hugefq93t27g8fh9wq"
        });
        events.push({
            type: "accept",
            content: { 
                workplace: "The Patio 23",
                position: "waiter",
                start: new Date("May 21, 2016 12:00:00"),
                end: new Date("May 21, 2016 20:30:00"),
                taker: { userId: "e70727",
                    name: "Sarah Birwani"
                },
                poster: { userId: "e7073249",
                    name: "Walter Disney"
                },
                manager: { userId: "e909",
                    name: "Workey McWork"
                },
            },
            timestamp: new Date("May 20, 2016 18:22:02"),
            noId: "sd98hduif987gr3hf98sd7fhuisfjdsf"
        });
    }

    if (!found) {
        reason += 'User not found. ';
    }

    data['status'] = found;
    data['reason'] = reason;
    data['events'] = events;
    res.json(data);  // json stringifies and sets application/json header.
});




app.get('^/api/notification/:notUsedParam$', function (req, res, next) {
    routelog(req, res);

    // TODO: DB query to get all (unseen) notifications for user req.params
    var userId = req.sessionState.username;
    var found = utils.isLoggedIn(req.sessionState);

    
    // Lots to change ⛔️⛔️⛔️⛔️⛔️
    


    // Dummy data shifter/worker
    var data = {};
    var events = [];
    data['events'] = events;
    data['status'] = 1;
    data['reason'] = '';
    // if (req.params.userId === SHIFTER) {
        events.push({
            type: "post",
            content: {
                workplace: "The Patio 23",
                position: "waiter",
                start: new Date("May 21, 2016 12:00:00"),
                end: new Date("May 21, 2016 20:30:00"),
                duration: 30600000,
                description: "",
                incentive: 0,
                poster: { userId: "e70727",
                    name: "Sarah Birwani"
                }
            },
            timestamp: new Date("May 20, 2016 10:21:11"),
            noId: "sdhf98sdhfjiosdfshduf"
        });
        events.push({
            type: "feedback",
            content:{ 
                workplace: "The Patio 23",
                position: "waiter",
                start: new Date("May 21, 2016 12:00:00"),
                end: new Date("May 21, 2016 20:30:00"),
                taker: { userId: "e70727",
                    name: "Sarah Birwani"
                },
                poster: { userId: "e7073249",
                    name: "Walter Disney"
                },
                manager: { userId: "e909",
                    name: "Workey McWork"
                },
                comment: "Please be on time.",
                rating: 4,
            },
            timestamp: new Date("May 21, 2016 23:00:00"),
            noId: "sda89fy89fsdfhsdfsdfh9sduf"
        });
        events.push({
            type: "accept",
            content: { 
                workplace: "The Patio 23",
                position: "waiter",
                start: new Date("May 21, 2016 12:00:00"),
                end: new Date("May 21, 2016 20:30:00"),
                taker: { userId: "e70727",
                    name: "Sarah Birwani"
                },
                poster: { userId: "e7073249",
                    name: "Walter Disney"
                },
                manager: { userId: "e909",
                    name: "Workey McWork"
                },
            },
            timestamp: new Date("May 20, 2016 18:22:02"),
            noId: "sd98hduif987gr3hf98sd7fhuisfjdsf"
        });
        events.push({
            type: "employ",
            content:{ 
                workplace: "The Patio 29",
                poster: { userId: "e7073249",
                    name: "Walter Disney"
                },
                manager: { userId: "e909",
                    name: "Workey McWork"
                },
            },
            timestamp: new Date("May 05, 2016 11:53:55"),
            noId: "90ufjqiw032t89hugefq93t27g8fh9wq"
        });

    // } else if (req.params.userId === 'm1') {
    //     events.push({
    //         type: "approve",
    //         content:{ 
    //             workplace: "The Patio 23",
    //             position: "waiter",
    //             start: new Date("May 21, 2016 12:00:00"),
    //             end: new Date("May 21, 2016 20:30:00"),
    //             duration: 30600000,
    //             description: "",
    //             incentive: 0,
    //             manager: { userId: "asfy89f9sdfsjfsdfjs8d",
    //                 name: "Manny Manage"
    //             },
    //             poster: { userId: "df7g9h654s56f78ghu",
    //                 name: "Guy McMan"
    //             },
    //             taker: { userId: "s89fd98sdfhsi",
    //                 name: "Tooky McTook"
    //             }
    //         },
    //         timestamp: new Date("May 20, 2016 15:21:11"),
    //         noId: "dfshd9f8hsdiufhsdfjksdf987e"
    //     });
    //     events.push({
    //         type: "permit",
    //         content: { 
    //             workplace: "The Patio 29",
    //             poster: {
    //                 userId: "90fe89ijo938yr7ghudsf9f",
    //                 name: "Guy McMan"
    //             }
    //         },
    //         timestamp: new Date("May 03, 2016 09:02:10"),
    //         noId: "89sydfhu98327fhujqw09382rfuidsf"
    //     });
    // }

    if (!found) {
        data['status'] = 0;
        data['reason'] = 'User not logged in.';
    } else {
        data['events'] = events;
    }

    res.json(data);  // json stringifies and sets application/json header.
});


/*
search for coworkers (all coworkers of searchQuery user) or any work name.
note that admin dont have/use the search feature.
GET     /api/search/user/{person name}
GET     /api/search/work/{work name}
*/
app.get('^/api/search/:searchType/:searchQuery$', function (req, res, next) {
    routelog(req, res);
    var data = {};
    var results = [];  // return empty if no matches.
    var status = 1;
    var reason = '';

    // Note that the encoded URI is somehow automatically unencoded..
    var searchType = sanitizer.escape(req.params.searchType).trim();
    var searchQuery = sanitizer.escape(req.params.searchQuery).trim();

    // Guard against searching nothing.
    if (searchType === '' || searchQuery === '') {
        return;
    }

    // Search by person name. (returns all matches who are coworkers)
    if (searchType === 'user') {

        // DB query to get data based on different searchQuery (user Id)
        var q = `SELECT username, 
                    firstname || ' ' || middlename  || ' ' || lastname as name,
                    array_agg(workname) as workplaces_array
                FROM users
                LEFT JOIN employee USING(uid)
                LEFT JOIN job USING(jobid)
                WHERE LOWER(firstname) ILIKE '%`+searchQuery+`%'
                OR LOWER(middlename) ILIKE '%`+searchQuery+`%'
                OR LOWER(lastname) ILIKE '%`+searchQuery+`%'
                GROUP BY uid;`;

        query(q, function(err, result) {
            if (err) {  // details contained in err.error
                console.error('error running query', err);
                data['reason'] = 'Sorry, database error searching names :(';
                data['status'] = 0;
                res.json(data);
                return err;  // Guard/block anything below from running.
            }

            var entry = result.rows;
            // console.log(entry);
            if (entry.length) {  // not empty.
                for (var i in entry) {
                    results.push({
                        userId: crypt.encrypt(entry[i].username),
                        name: entry[i].name,
                        worksAt: entry[i].workplaces_array
                    });
                }
            }
            else {
                reason += 'Person not found. ';
                status = 0;
            }
            data['results'] = results;
            data['status'] = status;
            data['reason'] = reason;
            res.json(data);  // json stringifies and sets application/json header.
        });
    }

    // Search by workplace name (assumed to be unique).
    else if (searchType === 'work') {

        // DB query to get data based on different searchQuery (user Id)
        var q = `SELECT workname, 
                    address || '\n' || 
                    city || ', ' || 
                    region || ', ' || 
                    postzip || '\n' || 
                    country as workplace,
                    array_agg(position) as positions_array
                FROM WorkLocation
                JOIN Job USING(workname)
                WHERE LOWER(workName) ILIKE '%`+searchQuery+`%'
                OR LOWER(address) ILIKE '%`+searchQuery+`%'
                OR LOWER(city) ILIKE '%`+searchQuery+`%'
                OR LOWER(region) ILIKE '%`+searchQuery+`%'
                OR LOWER(postzip) ILIKE '%`+searchQuery+`%'
                OR LOWER(country) ILIKE '%`+searchQuery+`%'
                GROUP BY workname;`;

        query(q, function(err, result) {
            if (err) {  // details contained in err.error
                console.error('error running query', err);
                data['reason'] = 'Sorry, database error searching work :(';
                data['status'] = 0;
                res.json(data);
                return err;  // Guard/block anything below from running.
            }

            var entry = result.rows;
            // console.log(entry);
            if (entry.length) {  // not empty.
                for (var i in entry) {
                    // console.log(entry[i].positions_array);
                    results.push({
                        name: entry[i].workname,
                        address: entry[i].workplace,
                        positions: entry[i].positions_array
                    });
                }
            }
            else {
                reason += 'Work not found. ';
                status = 0;
            }

            data['results'] = results;
            data['status'] = status;
            data['reason'] = reason;
            res.json(data);  // json stringifies and sets application/json header.
        });
    }
});


/* E.g.
the database timestamp format is: '2016-07-29 09:00:00.830332-04'
our javascript format is: "Fri Jan 01 2016 01:00:00 GMT-0500 (EST)"

you can see it works in postgre:
select to_timestamp('2016-1-1, 1:0:0', 'YYYY-MM-DD, HH24:MI:SS');
to psql:  2016-01-01 01:00:00-05

Note: There is no time difference between Greenwich Mean Time and Coordinated Universal Time
*/
function get_sql_timestamp_format(jsDate) {
    var dateObject = new Date(jsDate);

    // We define the format we use:  'YYYY-MM-DD, HH24:MI:SS'
    var temp = dateObject.getFullYear() + '-' +
              (dateObject.getMonth() + 1) + '-' +  // number (from 0 to 11)
              dateObject.getDate() + ', ' +
              dateObject.getHours() + ':' +  // (from 0-23)
              dateObject.getMinutes() + ':' +
              dateObject.getSeconds();

    // console.log(temp);
    return temp;
}



// TODO: validate all these inputs: non-optional fields cannot be empty, numeric fields should contain numbers, startTime < endTime, time is not past, etc...
app.post('^/api/shift/new/$', function (req, res, next) {
    routelog(req, res);

    // Dummy data shifter/worker
    var data = {};
    var reason = '';
    var status = 1;

    // REQ: userId and workplace must exist in database.
    var body = parseBody(req.body);
    var userId = '';
    var workplace = sanitizer.escape(body.workplace);
    // Date() object format expected:
    var startTimeEsc = sanitizer.escape(body.startTime);
    var startTime = get_sql_timestamp_format(startTimeEsc);
    var endTimeEsc = sanitizer.escape(body.endTime);
    var endTime = get_sql_timestamp_format(endTimeEsc);
    var position = sanitizer.escape(body.position);
    var description = sanitizer.escape(body.description);
    var incentive = sanitizer.escape(body.incentive);  // int type.

    try {
        // Note: use req.sessionState.username instead!!
        userId = req.sessionState.username;
        // TODO: need to check if utils.isLoggedIn(req.sessionState)!!
        // userId = crypt.decrypt(sanitizer.escape(body.userId));
    } catch (e) {
        if (e instanceof TypeError) {  // catch only this specific error.
            reason += 'Unrecognized User. ';
            console.error('Caught Error:', reason, e);
            data['reason'] = reason;
            data['status'] = 0;
            res.json(data);  // Respond.
            return;
        } else {
            throw e; // let others bubble up
        }
    }

    // Check valid datetimes
    if ((startTime >= endTime) || (new Date(startTimeEsc) == 'Invalid Date' || new Date(endTimeEsc) == 'Invalid Date')) {
        reason += 'Invalid Start or End time. ';
        data['reason'] = reason;
        data['status'] = 0;
        res.json(data);  // Respond.
        return;  // make sure doesnt try to do anything else..
    }

    // TODO: More guards and checks on user input here........

    // TODO: check that allll the fields in the date/time are entered. somehow it confirms even if some month/day/hour/minutes are not filled out.

    // TODO: more db checks, like that exact same shift was not already posted by the same user?


    // DB query to get data based on different userId/workplace..
    // Check if legit workplace/position.. and if they work there..
    var q = `SELECT *
        -- user must exist
        FROM users
        JOIN employee USING(uid)
        JOIN job USING(jobid)

        -- the shift workplace/position must exist
        -- and they must work there.
        WHERE workname='`+ workplace +`'
        AND position='`+ position +`'
        AND username='`+ userId +`'

        -- user cannot be banned
        AND uid NOT IN (
            SELECT uid
            FROM ban
        )
        -- user must be authorized
        AND uid NOT IN (
            SELECT uid
            FROM Unauth
        );`;


    query(q, function(err, result) {
        if (err) {  // details contained in err.error
            console.error('error running query', err);
            data['reason'] = 'Sorry, database error XXXXX :(';
            data['status'] = 0;
            res.json(data);
            return err;  // Guard/block anything below from running.
        }

        var entry = result.rows;
        // console.log(entry);
        if (entry.length) {  // if the workplace/position does exist.
            // Then do new query to insert 

            // if there exists something, then we can insert then to apply for it!
            // ....

            // TODO: convert this into a trigger, where all the inserts are done if the above
            // passes.. on insert into Shift initially.

            // post new Shift

            // Notify all coworkers

            // History for the user id only

            // EventType

            // Events
            
        }
        else {
            reason += 'Sorry, user or workplace or position not found. ';
            status = 0;
        }
        data['status'] = status;
        data['reason'] = reason;
        res.json(data);  // stringifies and sets application/json header.
    });
});




// TODO: validate all these inputs: non-optional fields cannot be empty, numeric fields should contain numbers, startTime < endTime, time is not past, etc...
app.post('^/api/shift/accept/$', function (req, res, next) {
    routelog(req, res);
    
    // Dummy data shifter/worker
    var data = {};
    var reason = '';

    // TODO: DB query to get data based on different userId
    // REQ: userId and workplace must exist in database.
    var body = parseBody(req.body);
    var userId = '';
    var workplace = sanitizer.escape(body.workplace);
    var noId = sanitizer.escape(body.noId);  // unique notification id.
    try {
        // Note: use req.sessionState.username instead!!
        userId = req.sessionState.username;
        // TODO: need to check if utils.isLoggedIn(req.sessionState)!!
        // userId = crypt.decrypt(sanitizer.escape(body.userId));
    } catch (e) {
        if (e instanceof TypeError) {  // catch only this specific error.
            reason += 'Unrecognized User. ';
            console.error('Caught Error:', reason, e);
            validUriParam = false;
        } else {
            throw e; // let others bubble up
        }
    }

    // TODO: replace these temporary dummy checks
    var foundUser = userId === 's1' || userId === 'm1';
    var foundWorkplace = workplace != '';
    var foundNoId = noId != '';
    
    if (!foundUser) {
        reason += 'User not found. ';
    }

    if (!foundWorkplace) {
        reason += 'Workplace not found. ';
    }

    if (!foundNoId) {
        reason += 'Notification not found. ';
    }

    // TODO: check for absence of any other errors too..
    data['status'] = (foundUser && foundWorkplace && foundNoId) ? 1 : 0;
    data['reason'] = reason;

    res.json(data);  // json stringifies and sets application/json header.
});



// TODO: validate all these inputs: non-optional fields cannot be empty, numeric fields should contain numbers, startTime < endTime, time is not past, etc...
app.post('^/api/shift/permit/$', function (req, res, next) {
    routelog(req, res);
    // Dummy data shifter/worker
    var data = {};
    var reason = '';

    var body = parseBody(req.body);
    var result = sanitizer.escape(body.result);  // "accept" or "decline"
    var noId = sanitizer.escape(body.noId);  // unique notification id.

    // TODO: replace these temporary dummy checks
    var foundResult = result === 'accept' || result === 'decline';
    var foundNoId = noId != '';
    
    if (!foundResult) {
        reason += 'Result not acceptable. Try "accept" or "decline". ';
    }

    if (!foundNoId) {
        reason += 'Notification not found. ';
    }

    // TODO: check for absence of any other errors too..
    data['status'] = (foundResult && foundNoId) ? 1 : 0;
    data['reason'] = reason;

    res.json(data);  // json stringifies and sets application/json header.
});



// TODO: validate all these inputs: non-optional fields cannot be empty, numeric fields should contain numbers, startTime < endTime, time is not past, etc...
app.post('^/api/shift/comment/$', function (req, res, next) {
    routelog(req, res);

    // Dummy data shifter/worker
    var data = {};
    var reason = '';

    // REQ: comment cannot be empty.
    var body = parseBody(req.body);
    var comment = sanitizer.escape(body.comment);  // managers comment.
    var noId = sanitizer.escape(body.noId);  // unique notification id.

    // TODO: replace these temporary dummy checks
    var validComment = comment != '';
    var foundNoId = noId != '';
    
    if (!validComment) {
        reason += 'Comment cannot be empty. ';
    }

    if (!foundNoId) {
        reason += 'Notification not found. ';
    }

    // TODO: check for absence of any other errors too..
    data['status'] = (validComment && foundNoId) ? 1 : 0;
    data['reason'] = reason;
    res.json(data);  // json stringifies and sets application/json header.
});



/*
    https://tools.ietf.org/html/draft-ietf-oauth-v2-15#section-4.3
     +---------+                                  +---------------+
     |         |          Client Credentials      |               |
     |         |>--(B)---- & Resource Owner ----->|               |
     | Client  |         Password Credentials     | Authorization |
     |         |                                  |     Server    |
     |         |<--(C)---- Access Token ---------<|               |
     |         |    (w/ Optional Refresh Token)   |               |
     +---------+                                  +---------------+
*/
app.post('^/api/login/$', function (req, res, next) {
    routelog(req, res);
    
    var data = {};
    var body = parseBody(req.body);
    var identifier = sanitizer.escape(body.username);  // not hashed.
    var password = sanitizer.escape(body.password);

    // Get the password to compare to the hash. Templates used for parameters.
    // https://www.npmjs.com/package/sql-template-strings
    var q = SQL`SELECT users.uID, username, email, passHash, firstname, admin.uID=users.uID as isadmin
        FROM Users
        JOIN login
        USING (uID)
        ,admin  -- cartesian join with admin
        WHERE username=${identifier} OR email=${identifier};`;

    // DB query to get data based on different userId or email.
    query(q, function(err, result) {

        var reason = '';
        var redirect = '';

        if (err) {  // details contained in err.error
            console.error('error running query', err);
            reason += 'Sorry, database error :(';
            data['reason'] = reason;
            data['redirect'] = redirect;
            res.json(data);
            return err;  // Guard/block anything below from running.
        }

        // sanity check: this shouldnt raise anything.
        assert(result.rows.length <= 1, 'length of rows');

        var entry = result.rows[0];
        if (entry != undefined) {  // not empty.
            // console.log(entry);

            // still need to check password.
            if (hash.compare(password, entry.passhash)) {

                // set session cookie (hashed)
                req.sessionState.username = entry.username;
                // also set the expires time.
                req.sessionState.expires = utils.setExpires();
                // Set the admin status (checked at /admin/ endpoint)
                req.sessionState.isAdmin = entry.isadmin;  // true/false

                // set cookie, with same expires as sessionState cookie.
                res.cookie('userId', 
                    crypt.encrypt(entry.username), 
                    {expires: new Date(utils.setExpires())}
                )

                // if success, takes to profile page or admin page
                if (entry.isadmin) {
                    redirect = '/admin';  // If admin.
                } else {
                    redirect = '/profile';
                }

            } else { // incorrect password
                reason += 'Incorrect password. ';
            }
        }
        else {  // wrong login details.
            reason += 'Incorrect username/email or password. ';
        }
        data['reason'] = reason;
        data['redirect'] = redirect;
        res.json(data);  // json stringifies and sets application/json header.
    });
 
});



// Testing [mock database]: username 'a1', 's1', 'm1' exists/taken. 
// empty string '' is an invalid username/pass.
// TODO: check for any invalid chars from password/username/email, and return
// message to user telling them what they cant do.
app.post('^/api/signup/$', function (req, res, next) {
    routelog(req, res);

    // Dummy data shifter/worker
    var data = {};

    var body = parseBody(req.body);
    var username = sanitizer.escape(body.username);  // not hashed.
    var password = sanitizer.escape(body.password);
    var email = sanitizer.escape(body.email);

    var q = SQL`
        -- check for username or password..
        SELECT email
        FROM users
        WHERE email=${email}
        UNION
        SELECT username
        FROM users
        WHERE username=${username};`;

    query(q, function(err, result) {

        data['reason'] = '';
        data['redirect'] = '';

        var validPass = password != '';  // TODO: validation checks..
        var validEmail = email != '';
        var validUsername = username != '';

        if (err) {  // details contained in err.error
            console.error('error running query', err);
            data['reason'] = 'Sorry, database error :(';
            res.json(data);  // json stringifies and sets application/json header.
            return err;  // Guard/block anything below from running.
        }

        if (!validPass) {
            data['reason'] = 'Invalid password. ';
        }
        if (!validEmail) {
            data['reason'] = 'Invalid email. ';
        }
        if (!validUsername) {
            data['reason'] = 'Invalid username. ';
        }

        // Return after assessing validity, if fails any.
        if (!validPass || !validEmail || !validUsername) {
            res.json(data);
            return;
        }

        // console.log(result.rows);
        if (!result.rows.length) {  // credentials available.
            var entry = result.rows[0];
            // console.log(entry);

            // set session cookie (hashed)
            req.sessionState.username = username;

            // also set the expires time.
            req.sessionState.expires = utils.setExpires();

            // set cookie, with same expires as sessionState cookie.
            res.cookie('userId', 
                crypt.encrypt(username), 
                {expires: new Date(utils.setExpires())}
            );

            var hashPass = hash.hash(password);

            // TODO: insert uID/authCode/numGuesses into Auth.

            // Insert the same bigserial value into Users and Login.
            var triggerInsert = `CREATE OR REPLACE FUNCTION insert_user() 
            RETURNS TRIGGER AS $insert_user_trigger$
            BEGIN
                IF (TG_OP = 'INSERT') THEN
                    INSERT INTO Login 
                    VALUES (new.uid, '`+hashPass+`');  -- new.uid is the autogenerated value.
                    RETURN NEW;  -- allows insert of new row in original table Users.
                END IF;
                RETURN NULL; -- result is ignored since this is an AFTER trigger
            END;
            $insert_user_trigger$ LANGUAGE plpgsql;


            -- Register our trigger procedure on Users table.
            -- Note: have to register trigger separately for insert/delete [not shown].
            DROP TRIGGER IF EXISTS insert_user_trigger ON Users;
            CREATE TRIGGER insert_user_trigger
            -- ***Audits are done 'AFTER' (unlike checks which are done 'BEFORE').
            AFTER INSERT ON Users
            FOR EACH ROW
            EXECUTE PROCEDURE insert_user();

            INSERT INTO Users VALUES 
            (DEFAULT, '`+email+`', '`+username+`', null, null, null);`;

            // Store in database.
            query(triggerInsert, function(err, result) {
                if (err) {  // details contained in err.error
                    console.error('error running query', err);
                    return err;  // Guard/block anything below from running.
                }
            });

            // if success, takes to profile page
            data['redirect'] = '/profile';

        } else {  // wrong login details.
            data['reason'] += 'Login credentials are taken. ';
        }
        res.json(data);  // json stringifies and sets application/json header.
    }); // -- query
});




app.get('^/api/logout/$', function (req, res, next) {
    routelog(req, res);

    if (!req.sessionState.username) {
        // Dummy data shifter/worker
        var data = {};
        data['reason'] = 'Already logged out. ';
        res.json(data);  // json stringifies and sets application/json header.
        return;
    } else {
        // To terminate the session, use the reset function on the session cookie.
        // It invalidates the hashed cookie token(s) on the client, which was used to authenticate on the server.
        req.sessionState.reset();  // set

        // if success, takes to login page
        // res.render('login', {
        //     title: 'Login'
        // });
        res.redirect('/login');
    }
});




// methods are: POST, DELETE.
app.all('^/api/admin/userstatus/$', function (req, res, next) {
    routelog(req, res);
    // TODO: validate (admin) credentials in cookie against DB.
    // is it okay we used the hashed username as access token?? ==> depends if hash makes it not the same each time its set in client. if its different every time its okay.
    // https://tools.ietf.org/html/draft-ietf-oauth-v2-15#section-4.4.3
    var admin = req.sessionState.username;
    // TODO: check admin credentials.
    var adminIsAuthenticated = true;

    // TODO: DB query to check user exists, ... dummy data here:
    // note the uID would typically be the HASHED one the server sends on login..
    var uID = req.query.user;  // this is the IP address!
    var userExists = uID === 's1' || uID === 'm1' || uID === 'a1';

    if (userExists && adminIsAuthenticated) {
        if (req.method === 'POST') {  // Ban
            // TODO: database update

        } else if (req.method === 'DELETE') {  // Unban
            // TODO: database update

        } 
    }

    // Dummy data shifter/worker
    var data = {};
    var status =  1;  // success
    var reason =  '';  // 'reason' used only for failure status.

    if (!userExists) {
        status = 0;
        reason += 'User does not exist. ';
    } 

    if (!adminIsAuthenticated) {
        status = 0;
        reason += 'Admin is not authenticated/valid. ';
    }

    data['status'] = status;
    data['reason'] = reason;
    res.json(data);  // json stringifies and sets application/json header.
});




app.get('^/api/admin/errors/$', function (req, res, next) {
    routelog(req, res);
    
    // TODO: validate (admin) credentials in cookie against DB.
    // is it okay we used the hashed username as access token?? ==> depends if hash makes it not the same each time its set in client. if its different every time its okay.
    // https://tools.ietf.org/html/draft-ietf-oauth-v2-15#section-4.4.3
    var admin = req.sessionState.username;
    // TODO: check admin credentials.
    var adminIsAuthenticated = true;

    // Dummy data shifter/worker
    var data = {};
    var errorList = [];
    var status =  1;  // success
    var reason =  '';  // 'reason' used only for failure status.

    if (adminIsAuthenticated) {
        // TODO db query and fill:
        errorList.push({
            timestamp: "2000-12-16 12:21:13",
            errorstatus: 404,
            endpoint: "http://localhost:3000/api/admin/nothingHere/",
            IP: "72.66.29.221",
        });
        errorList.push({
            timestamp: "2000-12-16 12:21:13",
            errorstatus: 500,
            endpoint: "http://localhost:3000/api/login/",
            IP: "22.66.29.221",
        });
        errorList.push({
            timestamp: "2000-12-16 12:21:13",
            errorstatus: 404,
            endpoint: "http://localhost:3000/nothingHereEndpoint/",
            IP: "72.66.29.221",
        });
        data['errors'] = errorList;
    } 
    else {
        status = 0;
        reason += 'Admin is not authenticated/valid. ';
    }
    
    data['status'] = status;
    data['reason'] = reason;
    res.json(data);  // json stringifies and sets application/json header.
});



app.get('^/api/data/analytics/$', function (req, res, next) {
    routelog(req, res);
    
    // TODO: validate (admin) credentials in cookie against DB.
    // is it okay we used the hashed username as access token?? ==> depends if hash makes it not the same each time its set in client. if its different every time its okay.
    // https://tools.ietf.org/html/draft-ietf-oauth-v2-15#section-4.4.3
    var admin = req.sessionState.username;
    // TODO: check admin credentials.
    var adminIsAuthenticated = true;

    

    var MAXINTERVAL = 720;
    var queryInterval = Math.abs(parseInt(sanitizer.escape(req.params.interval))) || 24;  // default 24 hours.
    queryInterval = (queryInterval > MAXINTERVAL) ? MAXINTERVAL : queryInterval;
    var queryLocation = decodeURIComponent(sanitizer.escape(req.params.location)) || '/';  // default 24 hours.

    // Dummy data shifter/worker
    var data = {};
    var numRows = 0;
    var numUser = 0;
    var status =  1;  // success
    var reason =  '';  // 'reason' used only for failure status.
   
    if (!adminIsAuthenticated) {
        status = 0;
        reason += 'Admin is not authenticated/valid. ';
    } else {
        numRows = 221;
        numUser = 7;
    }

    data['numRows'] = numRows;
    data['numUser'] = numUser;
    data['status'] = status;
    data['reason'] = reason;
    res.json(data);  // json stringifies and sets application/json header.
});


/*
curl http://localhost:3000/api/data/initialize/ -i -X DELETE -H "Content-Type: application/json"
*/
app.delete('^/api/data/initialize/$', function (req, res, next) {
    routelog(req, res);
    
    // Security flaw:
    // is it okay we used the encrypted username as access token?? ==> no bc the encrypted value is not the same each time its set in client. if its the same every time then its trivial to forge this!
    // https://tools.ietf.org/html/draft-ietf-oauth-v2-15#section-4.4.3

    // Dummy data shifter/worker
    var data = {};
    data['status'] = 1;  // 1=success, 0=fail
    data['reason'] = '';

    // Guard: check admin credentials.
    if (!utils.isLoggedIn(req.sessionState) || !req.sessionState.isAdmin) {
        data['status'] = 0;
        data['reason'] += 'Admin is not authenticated/valid. ';
    } else {
        // initialize (repopulate) database with schema/insert statements.
        // Note: async callback cant pass variables outside of scope.
        query(readCacheFile('../data/initdb.sql'), function(err, result) {
            if (err) {  // details contained in err.error
                console.error('error running query', err);
                data['reason'] += 'Database error: ' + err;
                return err;  // Guard/block anything below from running.
            }
            console.log('||| DATABASE INITIALIZED |||');
        });
    }

    res.json(data);  // json stringifies and sets application/json header.
});





module.exports = app;

