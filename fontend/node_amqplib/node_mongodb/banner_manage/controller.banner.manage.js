'use strict';

var BannerContent = require('./model.banner.manage');

exports.mongoDelete = function(data, callback) {
    BannerContent.findOneAndRemove({
        'id': data
    }, function(err) {
        callback(err === null);
    });
};

exports.mongoSave = function(data, callback) {
    BannerContent.findOneAndUpdate(
        {id : data.id},
        {$set : data},{
            upsert : true,
            new : true
        }, function(err, results){
            callback(err === null);
        }
    );
};