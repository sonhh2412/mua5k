'use strict';

module.exports = {
    saveAddress: function(key, values, callback) {
        process.REDIS_APP.hmset("address", key, JSON.stringify(values), function(err, result) {
            callback(err, result);
        });
    },
    getAddress: function(key, callback) {
        process.REDIS_APP.hget("address", key, function(err, result) {
            callback(err, result);
        });
    },
};