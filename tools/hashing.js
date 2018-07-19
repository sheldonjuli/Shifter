/*
The following uses the synchronous method. Look here if you want async:
https://github.com/ncb000gt/node.bcrypt.js/

The characters that comprise the resultant hash are ./ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789$.

Resultant hashes will be 60 characters long.
*/

var bcrypt = require('bcrypt');
var saltRounds = 10;
var salt = bcrypt.genSaltSync(saltRounds);


/* 
Return the hash to store somewhere, like your database.
*/
module.exports.hash = function(text){
    return bcrypt.hashSync(text, salt);
}

/* 
Hashing is 1-way, so we can only "compare", not "unhash".
*/
module.exports.compare = function(text, hash){
    return bcrypt.compareSync(text, hash); 
}
