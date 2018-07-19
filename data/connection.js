var pg = require('pg');
var url = require('url');

/*
Recall this behaves as a 'Singleton' since Node caches requests for the same 
module, even across requiring in different files.

So the file is cached only once into memory, to serve it more efficiently. This
makes it perfect to prevent duplicate copies of a database connection.

From https://github.com/brianc/node-pg-pool#a-note-on-instances

"The pool should be a long-lived object in your application. Generally you'll want to instantiate one pool when your app starts up and use the same instance of the pool throughout the lifetime of your application. If you are frequently creating a new pool within your code you likely don't have your pool initialization code in the correct place."

since pg's Client instances created via the constructor do not participate in pg's connection pooling. We take advantage of connection pooling with Pool.

http://stackoverflow.com/a/19282657/2352401
https://www.npmjs.com/package/pg-pool
https://github.com/brianc/node-postgres/wiki/Prepared-Statements#parameterized-queries

*/
module.exports = function() {

    if (process.env.ON_HEROKU) {  // only on heroku
        // In your app, configure the module to default to SSL connections. 
        // Then, connect to DATABASE_URL when your app initializes:
        pg.defaults.ssl = true;  // 
        var params = url.parse(process.env.DATABASE_URL);
        var auth = params.auth.split(':');
        
        // The Pool constructor does not support passing a Database URL as the parameter. To use pg-pool on heroku, for example, you need to parse the URL into a config object. Here is an example of how to parse a Database URL.
        // https://github.com/brianc/node-pg-pool#note
        var config = {
            user: auth[0],
            password: auth[1],
            host: params.hostname,
            port: params.port,
            database: params.pathname.split('/')[1],
            ssl: true
        };
        console.log("PostgreSQL Database started on Heroku.");
    } else {
        // create a config to configure both pooling behavior and client options.
        // note: all config is optional and the environment variables
        // will be read if the config is not present.
        // https://github.com/brianc/node-postgres/wiki/Client#parameters
        var config = {
            user: process.env.USER, //env var: PGUSER
            database: process.env.USER, //env var: PGDATABASE
            password: null, //env var: PGPASSWORD
            host: 'localhost',  // default value: localhost
            port: 5432, //env var: PGPORT, default value: 5432
            max: 20, // max number of clients in the pool (20 is free heroku max, 100 is postgres max)
            idleTimeoutMillis: 30000, // how long a client is allowed to remain idle before being closed. (30 seconds).
        };
        console.log("PostgreSQL Database started locally.");
    }

    // this initializes a connection pool
    // it will keep idle connections open for a 30 seconds
    // and set a limit of maximum 10 idle clients
    return new pg.Pool(config);;  // expose the pool to public.

}();  // self-invoking.

