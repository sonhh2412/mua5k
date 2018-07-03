'use strict';
var _ = require('lodash');
var express = require('express'), app = express();

var mongoose = require('mongoose');

var DeviceManage = require('../../../node_amqplib/node_mongodb/device_manage/model.device.manage');

var User = require('../../../node_amqplib/node_mongodb/res_user/model.res.user');

var FCM = require('fcm-push');

var serverKey = 'AAAAC6CQ61U:APA91bGjsXnAEEKOEUj1DaLG90CrUF0rWZLXGUix2HpvpwPw1SuZ2mGqeJRUMUsmr7_STeCcLpWpNBQScDwdvxWxFGzJldqKAwDS7rwQgWU73DFaSzbI5UTYk8a0Ua9oqlzDsznwfJeE';

var fcm = new FCM(serverKey);

exports.sendNotificationforOneUser = function(message_data, user_id) {
    var queryData = "",
        total_sent = 1,//so lan gui
        list_token = [],
        message = {
            collapse_key: 'mua5k',
            "data": {
                "title": 'Thông báo Mua5K',
                "message": message_data,   
            },
            notification: {
                title: 'Thông báo Mua5K',
                body: message_data
            }
        };
    User.findOne({_id: mongoose.Types.ObjectId(user_id)}, function(err, user){
        if (!err && user) {
            list_token = _.map(user.tokenApps, function(item){
                return item.tokenApp;
            });
            total_sent = list_token.length % 1000 ? Math.floor(list_token.length / 1000) + 1 : Math.floor(list_token.length / 1000);
            for (var i = 0; i < total_sent; i++) {
                message.registration_ids = list_token.splice(i*1000, 1000);
                fcm.send(message, function(err, response){
                    if (err) {
                        console.log(err);
                        console.log("Something has gone wrong!");
                    } else {
                        console.log("Successfully sent with response: ", response);
                    }
                });
            }
            //callback style
            
        }
    })
};

exports.sendNotificationforManyUser = function(message_data, user_ids) {
    var queryData = "",
        list_token = [],
        list_token_sent = [],
        total_sent = 1,//so lan gui
        message = {
            collapse_key: 'mua5k',
            "data": {
                "title": 'Thông báo Mua5K',
                "message": message_data,   
            },
            notification: {
                title: 'Thông báo Mua5K',
                body: message_data
            }
        };
    user_ids = _.map(user_ids, function(user_id) {
        return mongoose.Types.ObjectId(user_id);
    });
    User.aggregate([
        {
            $match: {
                _id: { $in: user_ids}
            }
        },
        {
            $unwind: '$tokenApps'
        },
        {
            $project: {
                _id: 0,
                tokenApps: 1
            }
        }
    ]).exec(function(err, results){
        if (!err && _.size(results) > 0) {
            list_token = _.map(results, function(item) {
                return item.tokenApps.tokenApp;
            });
            list_token = list_token.filter(function(value, index, self) {
                return self.indexOf(value) === index;
            });
            total_sent = list_token.length % 1000 ? (Math.floor(list_token.length / 1000)) + 1 : Math.floor(list_token.length / 1000);
            for (var i = 0; i < total_sent; i++) {
                message.registration_ids = list_token.splice(i*1000, 1000);
                message.registration_ids = message.registration_ids.filter(function(tokenId) {
                    return list_token_sent.indexOf(tokenId) < 0;
                });
                list_token_sent = list_token_sent.concat(message.registration_ids)
                fcm.send(message, function(err, response){
                    if (err) {
                        console.log(err);
                        console.log("Something has gone wrong!");
                    } else {
                        console.log("Successfully sent with response: ", response);
                    }
                })
            }
        }
    });
};

exports.sendNotificationforAllUser = function(message_data) {
    var queryData = "",
        list_token = [],
        total_sent = 1,//so lan gui
        message = {
            collapse_key: 'mua5k',
            "data": {
                "title": 'Thông báo Mua5K',
                "message": message_data,   
            },
            notification: {
                title: 'Thông báo Mua5K',
                body: message_data
            }
        };
    DeviceManage.find({isSendNotification:true}, function(err, results) {
        if (!err && _.size(results) > 0) {
            list_token = _.map(results, function(item) {
                return item.token_id;
            }),
            total_sent = list_token.length % 1000 ? (Math.floor(list_token.length / 1000)) + 1 : Math.floor(list_token.length / 1000);
            for (var i = 0; i < total_sent; i++) {
                message.registration_ids = list_token.splice(i*1000, 1000);
                fcm.send(message, function(err, response){
                    if (err) {
                        console.log(err);
                        console.log("Something has gone wrong!");
                    } else {
                        console.log("Successfully sent with response: ", response);
                    }
                })
            }
        }
    })
};