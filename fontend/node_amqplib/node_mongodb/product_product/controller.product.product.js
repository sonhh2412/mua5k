"use strict";
var Product = require('./model.product.product');


exports.mongoDelete = function(data, callback) {
    Product.findOneAndRemove({
        'id': data
    }, function(err) {
        callback(err === null);
    });
};

exports.mongoSave = function(data, callback) {

    if('createMQ' === data.type){
        data.session = [];
        data.convert = []
    }

    Product.findOneAndUpdate(
        {id : data.id},
        {$set : data},{
            upsert : true ,
            new : true
        }, function(err, results){
            callback(err === null);
        }
    );
};


