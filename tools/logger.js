/* Simple/quick logger, logs to console.
 * Why? ..because we want to turn it on and off.
 * ..Or divert to a file in the future..
 */
module.exports = function log(string) {
    // Switch to turn all logging on/off
    var SWITCH = true;
    if (SWITCH) {
        console.log(string);
    }
};
