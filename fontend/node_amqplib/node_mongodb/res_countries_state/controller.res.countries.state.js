"use strict";
var State = require('./model.res.coutries.state');

exports.mongoDelete = function(data, callback) {
    State.findOneAndRemove({
        'id': data
    }, function(err) {
        callback(err === null);
    });
};


exports.mongoSave = function(data, callback) {
    State.findOneAndUpdate(
        {id : data.id},
        {$set : {
            countries_id: data.countryId,
            code: data.code,
            id: data.id,
            name: data.name
        }},{
            upsert : true ,
            new : true
        }, function(err, results){
            callback(err === null);
        }
    );
};