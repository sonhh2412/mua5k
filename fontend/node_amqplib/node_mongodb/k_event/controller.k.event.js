"use strict";
var K_Even = require('./model.k.event');
var _ = require('lodash');

exports.mongoDelete = function(data, callback) {
	K_Even.findOneAndRemove({
        'id': data
    }, function(err) {
        callback(err === null);
    });
};


exports.mongoSave = function(data, callback) {
   
	K_Even.findOneAndUpdate(
        {id : data.id},
        {$set : data},{
            upsert : true ,
            new : true
        }, function(err, results){
            callback(err === null);
        }
    );
};