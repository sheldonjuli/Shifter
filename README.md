# Shifter

NOTICE: This project was done with Nigel Fong and Kyle Tam as the final project of CSC309. Code is no longer maintained and is for display only. The document below is taken directly from the old report and is not being updated. This repository is for display only. The commits do not reflect the actual working process.

--------------------------------------------------------------------------------------------------------------------------------

# ✨Shifter✨
CSC309 Assignment 4: The Sharing Economy



## Notes for TA
- 👉 Repo Location: https://github.com/nigef/309A4
- 👉 Some minor parts of the features are not fully implemented as you will see that the project is quite extensive. We apologize in advance for such a lengthy description of all the parts below. We believe this to be sufficient for the purpose of the assignment, and have left the other work for our personal development.
- 👉 Note that the instructor OMITTED the messaging feature from our specification since one group member dropped the course recently.




### Requirements
- Express 4.x


### Install Dependencies

```
npm install express nodemon express-validator sanitizer ejs body-parser pg client-sessions url sql-template-strings crypto bcrypt  chai mocha superagent --save
```

note: use `npm install <pkg> --save` to install a dependency and automatically it to your package.json's dependencies list.



### Run the Server

from the root location,
``` 
cd 309A4
```

..you can run the server (entry point) with `nodemon` in development mode,
``` 
nodemon server/server.js
```

..or for production (i.e. in the Heroku Procfile),
``` 
node server/server.js
```

Note you can configure nodemon to watch for changes in other file types. By default it does a recursive search from the current working directory.
```
nodemon -e js,html,ejs,sql
```

note: we leave the environment variable `NODE_ENV` as undefined or development, rather than production.

### Make requests 

Use port `3000` like `http://127.0.0.1:3000/` aka `http://localhost:3000/`

Entrypoints:
```
/
/login/
/logout/
/profile/
/messages/   <== deprecated
/admin/
```






### Some (Usernames, email, Passwords) that Work:

`Note that usernames are always encrypted on the client side`

```
 username |      email      |     password        | Encrypted username
----------+-----------------+------------------------------------------
 a1       | admin@admin.com |  1                  | 
 hi       | hi@aol.com      |  suchlongphrases    | 
 hey      | hey@aol.com     |  dogsitsoncouch     | 
 no       | no@aol.com      |  sombodyhasmustard  | 
 way      | way@aol.com     |  somanyredapples    | e70727
 man      | man@aol.com     |  toomuchwork        | 
 cool     | cool@aol.com    |  allthebrownbears   | 
 walt     | walt@disney.com |  carsgoreallyfast   | e7073249
 yo       | yo@aol.com      |  myhairsmells       | e909
 wat      | wat@aol.com     |  todayissunny       | 
 see      | see@aol.com     |  somuchmorefun      | 
```




### Dev mode

Note: in the development workflow, its nice to have the following tabs open in terminal:
- the `node` server to monitor console outputs
- cd into the data directory, and run `psql` to interact with local app database.
- general tab in `309A4` directory
- run postgres instance on online app database to interact with live data, `heroku pg:psql`
- monitor the heroku logs `heroku logs --tail`









### API Endpoints:

```
🚧 POST    /api/user/add/
✅ GET     /api/user/{UserIdHash}
🚧 POST    /api/user/{UserIdHash}
✅ DELETE  /api/user/{UserIdHash}
🚧 POST    /api/user/friend/

✅ POST    /api/work/add/

🚧 GET     /api/user/history/{UserIdHash}?past=<amount>
🚧 GET     /api/notification/?past=<amount>

✅ GET     /api/search/user/{person name}
✅ GET     /api/search/work/{work name}

✅ POST    /api/shift/new/
🚧 POST    /api/shift/accept/
🚧 POST    /api/shift/permit/
🚧 POST    /api/shift/comment/

⛔️ GET     /api/messages/
⛔️ GET     /api/messages/recent/?oid=<HASH_ID>

✅ POST    /api/login/
✅ POST    /api/signup/
✅ GET     /api/logout/

🚧 POST    /api/admin/userstatus?user=<HASH_IP>      ==kyle?
🚧 DELETE  /api/admin/userstatus?user=<HASH_IP>      ==kyle?
🚧 GET     /api/admin/errors/                        ==kyle?

🚧 GET     /api/data/analytics/?pasthours=24         ==kyle?
✅ DELETE  /api/data/initialize/
```

🚧 = dummy data done

⛔️ = development on hold. omitted by instructor.

✅ = database data done








## Purpose

The purpose of this application is to gain experience building backend endpoints that serve content to requests from the frontend. The idea for the service (shift sharing) is somewhat arbitrary, so the proof of concept may not be fully considered as a marketable service.


## Topic

Shifter makes it easy for coworkers to trade work shifts. Current methods to trade shifts have drawbacks: 
- Dispersed (text message, facebook, email, ...)
- Unreliable (no response ratings, reputation, ...). 
- Not open to people outside circles of friendships.
- Proprietary platform not supported by a certain workplace.
- Costs money 😂

The Shifter platform notifies coworkers of the shifts that you need to fill, and shows you extra shifts that you can take. Messaging and commenting helps you sort things out quickly. Ratings allow you to see who is reliable. Incentives help you fill an undesirable shift.

It's often the case that an employee doesn't know many people at work that well, which reduces the likelihood of participation in discussions to cover shifts. Shifter opens the pool of shift-takers to all eligible coworkers of their workplace. A greater audience results in more successful outcomes, quicker.


## Audience

Any shift worker can use this platform since it is not associated to any particular brands. The goal is to become the most widely used platform to trade shifts through the principles of trust, relevance, and convenience.


## Reputation System (Trust Mechanism)

A shift trading platform, like any open market is prone to bad 'players'. Reputation systems employ trust mechanism help to overcome some of the worries in a transaction. Shifter uses a feedback system, similar to eBay, after a shift exchange. The purpose of feedback is to promote reliability in the system (and discourage unreliability) of both the shifter and shiftee following-through.


## Creativity of the Topic

Is the project creative enough to distinguish it from existing web apps? 

None of the existing products (ShiftPlanning, Shyft, WhenIWork, Humanity, 7shifts, Homebase, JoltUp...) that we know of use the trust mechanisms, which are so important, described previously. The rankings also appear to be innovative.

All of the existing products in the marketplace are very new. In fact when this idea was thought of (earlier than taking CSC309 course), the main competitor (Shyft) did not exist.





## Structure, Organization

The physical layout of source files into folders matches logical hierarchy and organization. Looking at the file and directory names, and organization, provides insights into the design of the system. 


## User Interface.

The goal is to make the user experience (UX) as intuitive and convenient as possible. This refers to the layout of the user interface (UI) as well as the mechanisms used to promote positive interactions in the trading of shifts. One of the main goals of the platform is to make shift trading awesome.


## Addressing the 'Feature List'

The required feature list has been addressed and any additional features are described.



#### Profiling

Users (employees, and managers) have profiles. Users can update their personal information, and see the profiles of other users. 

Managers can view the activity of employees to stay on-top of changes in staffing, and possibly comment on it. They are notified, to allow or deny the shift transfers, and (are currently the only ones to) rate two users on the shift trade.

Profiles display the relevant user data, and can be searched by any other coworker that can trade shifts with the user. Managers have profiles with slightly different information displayed. Users can see their full history, but cannot see others' history.

Admin have a control page to manage users.



#### User Authentication and Authorization

Authenticate users based on passwords. 

Authentication through either: (a) at least one third-party authentication mechanism, such as Google, Facebook, or GitHub; or (b) two-factor authentication (via email).

Different users (defined as: employee, manager, admin) have different roles in the web app, and this defines which certain tasks that can be conducted by different users. For instance, a regular user can’t change the password or personal information of other users, but an admin can.



#### Social Network

In this sharing economy platform, the social network is relevant to the core goal or task of the platform. 

For instance, users are automatically follow their coworkers, with whom users can to message directly, share shifts, etc... 

Messaging allows for private discussions such as following-up on details of a shift, or a cheeky notification to a coworker, or asking if "Joe bailed out on covering your shift too". Notifications for messages are turned on by default.

As mentioned earlier, the users' ratings is core component of their profile, and the whole functionality of the app.

*Notifications* keep everyone up-to-date with what matters to them, and help transactions occur quickly. For example shift givers are notified when the spot is filled, and shift takers are notified when coworkers make a new shift available. This is non-trivial task to implement seen/unseen status of many different types of notification. For `n` users with `m` notifications and `k` types of notifications, we store O(nmk) notifications!! Luckily the average case is less terrible.

Notification types:
- (post) Notify all coworkers when a new shift is posted
- (approve) Notify manager when a worker requests to cover a shift, so they can allow/deny the transfer.
- (accept) Notify user when their posted shift transfer is accepted by manager i.e. someone covered the shift.
NEW - (employ) Notify user when their request to add a workplace is approved by a manager. i.e. the workplace is successfully added for user.
- (feedback) Notify users when there is feedback from manager.
- (permit) Notify manager when a new user tries to add a workplace to their places worked.

There are 4 types of Shift Transfers:
- Open (shift was posted, and waiting approval of manager. no assumption on amount of takers.)
- Approved (shift was approved by manager)
- Done (shift was accepted, and end time passed)
- Expired (start time passed, nobody took shift or manager didnt react)



#### Rating and Commenting

When a user (employee) shares a shift with another user, the manager can rate and comment on the exchange based on whether the experience was good or bad.

Managers can only comment on transfer when the status is 'done' i.e. the shift is over. Manager comments allow for them to provide extra info/explanations on shifts or shift outcome decisions.

Using this rating feature (ratings are visible on users profile page), others can decide whether to share or take a shift with that user or not.. to make informed decisions on making future transactions with certain users, and allows managers to monitor the behavior of the employees.



#### Search and Recommendation System

The web app provides basic search functionality to find coworkers. Using this feature, users can search and discover reliable coworkers to exchange shifts with. The search does a get request with the search body (userid, searchtype, messagebody) in the query string.

Users can also search for workplaces to add new work to their account. The workplace search does get request with the search body (userid, searchtype, messagebody) in the query string.

A smart recommendation system ranks other coworkers according to their ranking data when a manager chooses which workers to confirm/deny for a given shift transfer.

There is another smart recommendation system on the profile page, which lists the users based on either: interaction (messages sent), rating (average of ratings), activity (amount of shifts taken).



#### Admin

We provide basic admin functionality, including: 
- changing passwords
- adding, updating, and deleting users and their information
- initializing/repopulating the database.



#### Additional Features

TODO: repeat everything here that is considered 'additional' (or see for yourself, above and below...)

- Notifications (for new messages, new shifts available, your shift was filled, ratings need to be made, new ratings received)
- Trust mechanism (reputation system).
- Manager (User) are notified and can moderate shift transfers.
- History of user's activity displayed on their profile page.
- Increasing Application Performance with HTTP Cache Headers.
- express' `ejs` template
- Analytics: shows number of rows in database, number of users, number of queries in time interval since present and with option to count on a root path.
- 
- 


## Team Members
- Nigel Fong, g5n, nigel.fong@mail.utoronto.ca
- Kyle Long Que Tam, g5tamkyl, kai.tam@mail.utoronto.ca
- Li Ju, c5juli, sheldon.ju@mail.utoronto.ca


## Sections & Tasks Assigned for Part 2

A plan is laid out for implementation and team members are assigned to production of each feature.


### Pages
- [sheldon/kyle] Login: sign-in, sign-up, ...
- [sheldon/kyle] Profile page: types of users are employee & manager, display full history of shifts transactions taken/given, shows ratings, places worked, rankings (recommendation system) of people at work.
- [sheldon/kyle] Profile page of manager: managers get notifications of shift transfers to accept/deny them, and can comment on them.
- [sheldon/kyle] Admin page: platform owners changing passwords; adding, updating, and deleting users and their information; and initializing/repopulating the database, ...
- [sheldon/kyle] [EDIT: not part of A4 requirement] Messages: only supports binary relationships, chat history, (kinda like messenger), ...


### Shared Components
- [sheldon/kyle] Navigation: search, new shift, browse, messages, notifications, logout/(signin/signup), ...
- [sheldon/kyle] search coworkers "followed" in a dropdown.
- [sheldon/kyle] Notifications: when new shift available at work, when your shift taken, managers get notified of all activity at their location(s), new message, when someone comments on your page or shift thread, an IOU status change, ...
- [sheldon/kyle] Shift popup: should be a fast modal that opens from nav, on any page, with quick picker options, ...



### Server
- [nigel] 2-factor authentication with [`nodemailer`](https://github.com/nodemailer/nodemailer), [more on nodemailer](https://nodemailer.com/) and [`speakeasy`](https://github.com/speakeasyjs/speakeasy), or third-party auth with Google or Facebook..
- [nigel] set up live site on (free) Heroku, ...
- [nigel] server, endpoints (w/ parameters), router, controllers, ...
- [nigel] server-side security (sanitize/cleanse for SQL injection, script injection..) with `express-validator`: https://github.com/ctavan/express-validator
- [nigel] server-side SHA-X hashing (password, userid)
- [nigel] PostgreSQL database, ER/schema, using `pg` module. https://www.npmjs.com/package/pg
- [nigel] database queries, formatting JSON, ...
- [nigel] middleware, ...
- [nigel] testing backend with mocha/... nodeunit? https://semaphoreci.com/community/tutorials/getting-started-with-node-js-and-mocha
- [nigel] sessions stored on client via sessions in encrypted tamper-free cookies, which is provided by the server on login, and can be invalidated any time by server. https://github.com/mozilla/node-client-sessions
- [nigel] status codes: 404 page from template when a resource not found for website, otherwise send 404 header for API JSON requests. Similar difference for 500 error.
- [nigel] express' `ejs` template (like lab9) to include redundant components in pages, and dynamically set elements on server-side to reduce http requests.
- [nigel] contract of JSON communication between client/server.





### Other
- [nigel] the idea.pdf file (i.e. this README.md)
- [sheldon/kyle] ajax requests on front-end, and related...
- [sheldon/kyle] client-side validation of form content: https://www.npmjs.com/package/validator
- [sheldon/kyle] testing frontend with mocha/jasmine/...
- [unassigned] "A section describing the measures you’ve taken to improve your web app’s performance, including results from your testing."
- [unassigned] "potential security vulnerabilities and how you’ve tested your app for these. If you’ve used any security framework for this, describe it here."



## Enhancement Ideas (Choose any)
- Open the API to developers, with documentation, and more endpoints.
- Using React.js for all components/props/state...
- Incentives (monetary) from by individuals to motivate shift takers in unpopular shifts (just keeping track of IOUs open/closed, and reputation/rating of reliability when IOU are closed.)
- Reputation system using trust mechanisms to reduce bad behavior on the platform, and promote positive attributes that benefit the main goal.
- Implement some results of the research article to combat: negative rating retaliation in a shift exchange, 
- Shifts can be taken in-part if only part of the time ends up working for someone. Handling scheduling conflicts possible increases the complexity of this assignment beyond the scope..
- Employees enter their hourly, so we can give them the motivating $amount stat, in the last week, month, year... (optional: users define the time range).
- search bar has autofill as characters are typed.
- third-party authentication mechanism, such as Google, Facebook, or GitHub
- Admin page shows a log of suspicious activity, and an option to ban IP addresses by adding to an ip blacklist in the database.
- Admin can ban IP addresses.
- Security: Ban IP if too many failed logins.
- Admin page can do database queries to show analytics/stats: total users, total workplaces, amount and id of all users currently logged in, trends (important to always log dates) over time, other performance metrics, etc...
- Admin also can receive messages from users (customer support), and this interface can be accessed from admin page.
- Admin page shows blacklisted keywords (and the comments, with context, along with the user), with a button to edit the phrase, or delete the comment.
- Expand binary messaging to support group chats.
- Settings page (change username, change profile photo, email, phone number, password, timezone)
- on new user signup, procedurally generate 5x5 bitfield with 3 extra code bits (8 different colors) like 'XXX_0100100010010101010010100101' which encodes their image placeholder like github's.. instead of our using same img for all profile pics.
- Security: SSL certificate for https security.
- Security: Captcha plugin for protecting against Sign Ups.
- Messages: should group messages be supported? (The common implementation just supports 2-way relationships.)
- Undo action of taking shifts? Should it release the shift, and notify everyone its available again?
- What if people work at multiple locations? Maybe they want the privacy option to keep multiple profile separate without having to create different accounts. This is another enhancement idea.
- Find and eliminate all memory leaks: https://hacks.mozilla.org/2012/11/tracking-down-memory-leaks-in-node-js-a-node-js-holiday-season/
- Convert Synchronous computations into Asynchronous: https://hacks.mozilla.org/2012/11/fully-loaded-node-a-node-js-holiday-season-part-2/
- Add build tools to minify and concatenate css or js into separate prod resources.
- Redis in-memory data store.
- Log all error stacktraces to a file, with timestamps.
- Make notifications real-time, i.e. get notified live as events/actions happen.
- Make Notification for new friend added.
- Security: add 'nonce' so a captured req/res cannot be resubmitted by an attacker.
- Security: send a digest (i.e. like a checksum) with every request/response to regenerate the digest from the body to check if it has changed due to attack or network problem. you need to have the digest function on both ends to regenerate the digest to compare with.
- Security: Deep learning network with a back propagation to watch requests per second per ip to block denial of service attacks. LOL jk :P






## Missing Features

If some features are missing from the web app, explanations on how they would work are provided.



### Messaging with Socket.IO

http://socket.io/docs/rooms-and-namespaces/

- Use socket.io for multiple, real-time, 2-way chats between two people with rooms. [note that using socket.io allows for easier enhancement into group chats.. but group chats are very difficult to persist in db tables because of the combinations/cardinalities of different users.]
- Namespaces (assigning different endpoints or paths) allow for different live message 'rooms' between 2 users. This solution should be capable of scale.
- To scale, it is important to destroy the namespace after any one user closes their messaging page.
- PostgreSQL Database: messages are stored in a (ridiculously huge) table with the attributes: timestamp, userId, recipientId, message.








## Live Hosting on Heroku (with PostgreSQL database)

See live site at: `https://shifter309.herokuapp.com/`

provisioned with [postgresql Hobby Dev](https://devcenter.heroku.com/articles/heroku-postgresql#connecting-in-node-js): `heroku addons:create heroku-postgresql:hobby-dev`
- Row Limit: 10,000
- RAM: 0 Bytes
- Connection Limit: 20

you can check that it was provisioned: ` heroku pg:info`

Heroku runs your app by executing the main command in your Procfile. This is often a command to start a web server.

to [stream all console.log](https://devcenter.heroku.com/articles/logging) in: `heroku logs --tail`

to check whats running: `heroku ps`

to deploy: `git push heroku master`

to restart dyno: `heroku restart`

config environment varibles on heroku to detect its environment: `heroku config:set ON_HEROKU=true`

to check envars: `heroku config`

you run a bash session on heroku with `heroku run bash`

you run postgres in heroku terminal with `heroku pg:psql`













## Database

Recall, to run postgre locally,

```bash
# run postgre server:
postgres -D /usr/local/var/postgres

# run in different terminal tab:
psql

# note you can look at your config file at
cat /usr/local/var/postgres/postgresql.conf

# The instance postgresql used in the node app can be viewed in a separate psql instance. for example you can see the app relations with:
\d

# ..and you can query the app database from the terminal..

```

Uses PostgreSQL via the `pg` node module.

Prepopulate with some Admin credentials.

When we intialize, make sure to keep the admins. repopulating should add admins back too.

We need many tables to store (TODO: update based on latest refactoring)..

```SQL
Users(uID, email, firstname, middlename, lastname)

Login(uID, passHash)
Ban(uID, isbanned)
Unauth(uID, authCode, numGuesses)

Admin(uID)
Friends(uID, friendID)

WorkLocation(workName, address, city, region, postzip, country)
Job(jobID, workName, position)

Employee(uID, jobID)

Events(eventID)
EventType(eventTypeID, eventID, type, tstamp)
History(eventTypeID, deliverID)
Notify(eventTypeID, deliverID)
Apply(eventID, uID, jobID)
Shift(eventID, shifterID, start, finish, description, incentive)

Want(eventID, wanterID)
Took(eventID, takerID, managerId)
Feedback(eventID, managerId, comment, rating)

Messages(senderID, receiverID, body, tstamp)

Endpoints(uID, endpoint, IP, tstamp)
Errors(uID, endpoint, IP, errormessage, tstamp)
```

.. see the ER diagram in `/data/CSC309A4 ER Schema.pdf`

In the `pg` module, queries are queued and executed sequentially.

`pg` cannot handle prepared statements with more than 1 parameter, so we use [sql-template-strings](https://www.npmjs.com/package/sql-template-strings)

One major gotcha, is you need to `SET SEARCH_PATH...` before *every* query on heroku, otherwise it cant find your tables.

Note for very wide queries, you can toggle the column view off/on: `\x on`, `\x off`

To dump all the output to the terminal output: `\pset pager off`. Note you can also add it to your `~/.psqlrc`














#### Pooling

["PostgreSQL can support only a limited number of clients...it depends on (the amount of ram on your database server, but generally more than 100 clients at a time is a very bad thing. Additionally, PostgreSQL can only execute 1 query at a time per connected client, so pipelining all queries for all requests through a single, long-lived client will likely introduce a bottleneck into your application if you need high concurrency.

With that in mind we can imagine a situation where you have a web server which connects and disconnects a new client for every web request or every query (don't do this!). If you get only 1 request at a time everything will seem to work fine, though it will be a touch slower due to the connection overhead. Once you get >100 simultaneous requests your web server will attempt to open 100 connections to the PostgreSQL backend and 💥  you'll run out of memory on the PostgreSQL server, your database will become unresponsive, your app will seem to hang, and everything will break. Boooo!

Good news: node-postgres ships with built in client pooling. Client pooling allows your application to use a pool of already connected clients and reuse them for each request to your application. If your app needs to make more queries than there are available clients in the pool the queries will queue instead of overwhelming your database & causing a cascading failure. 👍 "](https://www.npmjs.com/package/pg)









#### Examples

[Prepared Statements](https://github.com/brianc/node-postgres/wiki/Prepared-Statements#parameterized-queries)

```javascript
// queries can be executed either via text/parameter values passed as individual arguments
// or by passing an options object containing text, (optional) parameter values, and (optional) query name
client.query({
    name: 'insert beatle',
    text: "INSERT INTO beatles(name, height, birthday) values($1, $2, $3)",
    values: ['George', 70, new Date(1946, 02, 14)]
});

// subsequent queries with the same name will be executed without re-parsing the query plan by postgres
client.query({
    name: 'insert beatle',
    values: ['Paul', 63, new Date(1945, 04, 03)]
});
var query = client.query("SELECT * FROM beatles WHERE name = $1", ['john']);

```









## Testing

To run the mocha unit tests from within the `309A4` directory:
```
./node_modules/.bin/mocha test/mocha_test.js
```

or you, run with: `npm test`



The results of the tests we have now:

```
✓ Test if GET /api/user/e70727 is responding and giving right format (43ms)
✓ Test if GET /api/user/history/... is responding and giving right format
X Test if GET /api/user/notification/... is responding and giving right format
✓ Test if GET /api/search/work/... is responding and giving right format
X Test if GET /api/search/user/... is responding and giving right format
✓ Test if GET /api/logout/ is responding and giving right format
✓ Test if it throws errors when given wrong url
✓ Test if POST /api/user/ is responding and getng right format
✓ Test if POST /api/user/add/ is responding and getng right format
✓ Test if POST /api/user/add/ is responding right when format is wrong
✓ Test if POST /api/work/add/ is responding and getng right format
✓ Test if POST /api/login/ can login with wrong u&p
✓ Test if POST /api/signup/ can signup with no input

✓ for success tests
X for failed tests
```


Also Using: [Chai Assertion Library](http://chaijs.com/api/assert/)

"Chai is a BDD / TDD assertion library for node and the browser that can be delightfully paired with any javascript testing framework."

e.g.

```javascript
assert.typeOf(foo, 'string');
assert.equal(foo, 'bar');
assert.lengthOf(foo, 3)
assert.property(tea, 'flavors');
assert.lengthOf(tea.flavors, 3);
```

In our app we catch the error so it doesn't crash our app, and log it to console stream, and log to our error analytics section of our database,
```
try {
    assert.lengthOf(result.rows, 1);
} catch (err) {
    console.error(err);
    // insert into our error db..
}
```

or you can assert booleans, along with an error message, like,
```
assert(result.rows.length <= 1, 'length of rows');
```







## Architecture

The web app follows a standard architecture (e.g., 3-tier, MVC, etc.). This means that functionality is kept out of views, the database is properly used, and any RESTful APIs are designed properly.

Front-end content is under `/assets_public/`

Server `/server/`

Routes `/routes/`

Controllers `/controllers/`

Tests `/test/`

Database `/data/*`

Utilities `/tools/`











## Security Measures

Preventative security measures are described and testing procedures and evidence is provided.

- Form validation on frontend. value validation on backend.
- Prevent Script injection on frontend end backend
- Prevent SQL injection on backend.
- cross-site request forgery (CSRF)
- [cookies](http://expressjs.com/en/api.html#res.cookie) are encrypted before sending to the client.
- [sanitizer](https://www.npmjs.com/package/sanitizer) used to sanitize strings from post request bodies and get request uri's, like:
```
var username = sanitizer.escape(body.username);
var password = sanitizer.escape(body.password);
```

#### Bcrypt

Hashing passwords data with bcrypt! We dont use SHA encryption for this because encryption is two ways and makes it less secure. Hashing is one way... Hashing is 1-way, so we can only "compare", not "unhash".

The following uses the synchronous method. Look here if you want async: https://github.com/ncb000gt/node.bcrypt.js/

The characters that comprise the resultant hash are ./ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789$.

Resultant hashes will be 60 characters long.

Note that hashes are always different for the same string! so you need to use the special compare method.



#### SHA encryption

We store user IDs in cookies, so we use a SHA encryption for this so the client never "sees" the user id. Encrypt and decrypt text is less secure than 1-way hashing. https://github.com/chris-rock/node-crypto-examples

We have done some testing on these potential security vulnerabilities. TODO show results..









## Sessions

Sessions that use cookies `client-sessions` was chosen over other types of sessions that store some state in server for [some good reasons](https://hacks.mozilla.org/2012/12/using-secure-client-side-sessions-to-build-simple-and-scalable-node-js-applications-a-node-js-holiday-season-part-3/)
1. the data is always available, regardless of which machine is serving a user
2. there is no state to manage on servers
3. nothing needs to be replicated between the web servers
4. new web servers can be added instantly

The session data is very easy to write and send to cookies on client. For example this will write the session cookie: `req.sessionState.foo = 'bar'` and it will be automatically encrypted on the client.

To terminate the session, use the reset function on the session cookie. It invalidates the hashed cookie token(s) on the client, which was used to authenticate on the server, like: `req.sessionState.reset();`

We must set a special setting on heroku since sessions benefits from using the same process, rather than splitting up with dynos. Read more for that [here](https://devcenter.heroku.com/articles/node-sessions).




## Creativity

See all sections, mentioned previously.






## Web App Interaction of the Parts

See a description of each part of our web app and how they interact with one another, mentioned previously.






