"use strict";
var Country = require('./model.res.country');

exports.mongoDelete = function(data, callback) {
    Country.findOneAndRemove({
        'id': data
    }, function(err) {
        callback(err === null);
    });
};


exports.mongoSave = function(data, callback) {
   
    Country.findOneAndUpdate(
        {id : data.id},
        {$set : data},{
            upsert : true ,
            new : true
        }, function(err, results){
            callback(err === null);
        }
    );
};