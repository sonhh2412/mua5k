'use strict';

var NewsContent = require('./model.news.content');

exports.mongoDelete = function(data, callback) {
    NewsContent.findOneAndRemove({
        'id': data
    }, function(err) {
        callback(err === null);
    });
};


exports.mongoSave = function(data, callback) {
   
    NewsContent.findOneAndUpdate(
        {id : data.id},
        {$set : data},{
            upsert : true,
            new : true
        }, function(err, results){
            callback(err === null);
        }
    );
};