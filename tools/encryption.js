// Encrypt and decrypt text is less secure than 1-way hashing.
// https://github.com/chris-rock/node-crypto-examples


// Nodejs encryption with CTR
var crypto = require('crypto');

// Use the AES256 algo.
var algorithm = 'aes-256-ctr';
// best to change this for each, but oh well.
var password = 'hiw2r19h8fwji9h8uisf8sdhfuoijr1298hfuijoqdw';


/* 

*/
module.exports.decrypt = function(text){
    var decipher = crypto.createDecipher(algorithm, password)
    var dec = decipher.update(text, 'hex', 'utf8')
    dec += decipher.final('utf8');
    return dec;
}

/* 

*/
module.exports.encrypt = function(text){
    var cipher = crypto.createCipher(algorithm, password)
    var crypted = cipher.update(text, 'utf8', 'hex')
    crypted += cipher.final('hex');
    return crypted;
}
