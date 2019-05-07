var redis = require('redis');
var thunkify = require('thunkify');
var config = require('./../config');
var logger = require('./../logger');

function log(type) {
    return function() {
        logger.logError(arguments);
    }
}

var client = redis.createClient(config.redisConfig.port, config.redisConfig.host, {retry_strategy: function(options) {return 300}});
client.on('reconnecting', log('reconnecting'));
client.on('error'       , log('error'));
client.on('end'         , log('end'));

module.exports = {

    setItem: function(key, value) {
        client.set(key, value);
    },

    setItemWithExpiry: function(key, value, expiryTime) {
        client.setex(key, expiryTime, value);
    },

    getItem: thunkify(function(key, callback) {
        client.get(key, function(err, res) {
            if(err) {
                logger.logError(err);
            }

            try {
                callback(err, JSON.parse(res));
            } catch(e) {
                callback(err, res);
            }

        });
    }),

    getItemWithCallback: function(key, callback) {
        client.get(key, function(err, res) {
            if(err) {
                logger.logError(err);
            }
            callback(err, res);
        });
    },

    deleteItem: function(key) {
        client.del(key, function(err, reply) {
            if(err) {
                logger.logError(err);
            }
        });
    },

    deleteItemThunked: thunkify(function(key, callback) {
        client.del(key, function(err, res) {
            if(err) {
                logger.logError(err);
            }

            callback(err, res);
        });
    }),

    addToSortedSet: function(setName, score, key) {
        client.zadd(setName, score, key);
    },

    getFromSortedSet: thunkify(function(setName, numOfElements, callback) {
        client.zrevrange(setName, 0, numOfElements - 1, 'withscores', function(err, res) {
            if(err) {
                logger.logError(err);
            }

            callback(err, res);
        })
    }),
    client:client,
};
