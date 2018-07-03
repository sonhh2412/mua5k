"use strict";
var Device_Manage = require('../device_manage/model.device.manage');
var _ = require('lodash');


exports.mongoDelete = function(data, callback) {
    Device_Manage.findOneAndRemove({
        '_id': data
    }, function(err) {
        callback(err === null);
    });
};

exports.mongoSave = function(data, callback) {
    
    Device_Manage.findOneAndUpdate(
        {_id : data._id},
        {$set : data},{
            upsert : true,
            new : true
        }, function(err, results){
            callback(err === null);
        }
    );
    
};