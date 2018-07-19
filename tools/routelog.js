var log = require('../tools/logger.js');
var crypt = require('../tools/encryption.js');
var hash = require('../tools/hashing.js');

// Print Stuff about endpoints
module.exports = function routelog(req, res, isEncrypted) {
    
    // only a few URI's have encrypted userID's..
    var params = JSON.stringify(req.params);
    if (isEncrypted && req.params.userId) {
        // console.log(req.params.userId, typeof(req.params.userId));
        // params = "===unencrypted===> /" + crypt.decrypt(req.params.userId);
    }

    log(req.method + ' ' + req.url + ' ' + params);
    // GET /notification/s1 {"parameter":"s1"}

    if (req.method === 'POST') {
        log('\t' + JSON.stringify(req.body));
    }
}

