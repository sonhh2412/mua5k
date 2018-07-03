"use strict";
var HelpContent = require('./model.help.content');

exports.mongoDelete = function(data, callback) {
    HelpContent.findOneAndRemove({
        'id': data
    }, function(err) {
        callback(err === null);
    });
};


exports.mongoSave = function(data, callback) {
   
    HelpContent.findOneAndUpdate(
        {id : data.id},
        {$set : data},{
            upsert : true,
            new : true
        }, function(err, results){
            callback(err === null);
        }
    );
};