var redisUtils = require('./redisUtils');
var uuid = require('uuid');
var thunkify = require('thunkify');

module.exports = {
    saveUserInSession: function(user, cookies) {
        var sessionId = uuid.v1();
        var sessionObj = {user: user};
        redisUtils.setItemWithExpiry(sessionId,  JSON.stringify(sessionObj), 86400*15);
        cookies.set("SESSION_ID", sessionId);
    },

    updateUserInSession: function(user, cookies) {
        var sessionId = cookies.get("SESSION_ID");
        var sessionObj = {user: user};
        redisUtils.setItemWithExpiry(sessionId,  JSON.stringify(sessionObj), 86400*15);
    },

    getCurrentUser: thunkify(function(sessionId, callback) {
        var currentUser;
        if(sessionId) {
            redisUtils.getItemWithCallback(sessionId, function(err, res) {
                if(err) {
                    logger.logError(err);
                }
                if(res == null) {
                    callback(currentUser);
                } else {
                    callback(err, JSON.parse(res).user);
                }
            });
        } else {
            callback(currentUser);
        }
    }),

    deleteSession: function(sessionId) {
        redisUtils.deleteItem(sessionId, function(err, reply) {
            if(err) {
                logger.logError(err);
            }
        });
    }
}
