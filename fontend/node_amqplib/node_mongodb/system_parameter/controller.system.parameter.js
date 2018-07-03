"use strict";
var SystemParameter = require('./model.system.parameter');

exports.mongoDelete = function(data, callback) {
    SystemParameter.findOneAndRemove({
        'id': data
    }, function(err) {
        callback(err === null);
    });
};


exports.mongoSave = function(data, callback) {
    SystemParameter.findOneAndUpdate(
        {id : data.id},
        {$set : data},{
            upsert : true,
            new : true
        }, function(err, results){
            callback(err === null);
        }
    );
};