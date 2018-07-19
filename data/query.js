var pool = require('../data/connection.js');

/*
Note 'pool' is a singleton, and has up to 20 cached connections on the free
heroku (otherwise postgre has up to 100 cached.)

Prepared Statements:
// https://github.com/brianc/node-postgres/wiki/Prepared-Statements#parameterized-queries


*/
module.exports = function(queryObject, callback) {

    pool.connect(function(err, client, done) {
        if (err) {
            return console.error('error fetching client from pool', err);
        }

        // Set search path on every query
        client.query('SET SEARCH_PATH TO shifter;');


        // note: you have to pass in a callback instead of using the return value of the client.query function because the query is async, but the parent method is synchronous. i.e. cannot return from the callback.
        var query = client.query(queryObject, callback);

        // note that query.on('end', ...) doens't work when callback is used in client.query()
        // .. however query.on('end', ...) DOES work when callback is used in client.query()

        query.on('end', function (result) {
            // console.log(JSON.stringify(result.rows, null, "    "));

            // don't forget to call `done()` to release the client back to the pool.
            done();
        });

    });

};



pool.on('error', function (err, client) {
    // if an error is encountered by a client while it sits idle in the pool
    // the pool itself will emit an error event with both the error and
    // the client which emitted the original error
    // this is a rare occurrence but can happen if there is a network partition
    // between your application and the database, the database restarts, etc.
    // and so you might want to handle it and at least log it out
    console.error('idle client error', err.message, err.stack);
});



