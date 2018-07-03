"use strict";
var mongoose = require('mongoose'),
    Category = require('./model.product.public.category');


exports.mongoDelete = function(data, callback) {
  Category.findOneAndRemove({
        'id': data
    }, function(err) {
        callback(err === null);
    });
};

exports.mongoSave = function(data, callback) {
    Category.findOneAndUpdate(
        {id : data.id},
        {$set : data},{
            upsert : true ,
            new : true
        }, function(err, results){
            callback(err === null);
        }
    );
};
