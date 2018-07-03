"use strict";
var Barnd = require('./model.product.brand');


exports.mongoDelete = function(data, callback) {
    Barnd.findOneAndRemove({
        'id': data
    }, function(err) {
        callback(err === null);
    });
};

exports.mongoSave = function(data, callback) {

    Barnd.findOneAndUpdate(
        {id : data.id},
        {$set : data},{
            upsert : true ,
            new : true
        }, function(err, results){
            callback(err === null);
        }
    );
};