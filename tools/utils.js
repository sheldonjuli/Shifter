/* 
Get the expiry "time" (epoch).
*/
module.exports.setExpires = function(amountHours) {
    // Default is 6 hours (in millis).
    var amountHours = amountHours || 6 * 60 * 60 * 1000;

    // The Date.now() method returns the number of milliseconds elapsed since 1 January 1970 00:00:00 UTC.
    return Date.now() + amountHours;
};

function _isExpired(epochValueMillis) {
    return epochValueMillis <= Date.now();
}

/* 
Returns boolean isExpired based on epoch.
*/
module.exports.isExpired = function(epochValueMillis) {
    _isExpired(epochValueMillis)
};

/* 
Returns boolean isLoggedIn based on token defined and not expired.
*/
module.exports.isLoggedIn = function(sessionState) {
    return (sessionState.username != undefined) && !_isExpired(sessionState.expires);
};


