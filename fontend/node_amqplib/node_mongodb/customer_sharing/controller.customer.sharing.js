"use strict";
var Customer_Sharing = require('../customer_sharing/model.customer.sharing');
var _ = require('lodash');


exports.mongoDelete = function(data, callback) {
    Customer_Sharing.findOneAndRemove({
        'id': data
    }, function(err) {
        callback(err === null);
    });
};

exports.mongoSave = function(data, callback) {
    
    Customer_Sharing.findOneAndUpdate(
        {id : data.id},
        {$set : data},{
            upsert : true,
            new : true
        }, function(err, results){
            callback(err === null);
        }
    );
    
};