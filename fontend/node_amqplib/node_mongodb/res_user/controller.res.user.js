"use strict";
var User = require('./model.res.user');
var ControlUser = require('../../../node_amqplib/node_mongodb/res_user/controller.res.user');
var Notify = require('../../../node_amqplib/node_mongodb/notify_content/model.notify.content');
var Notification10k = require("../../../server/api/user/notification");
var _ = require('lodash');

exports.mongoDelete = function(data, callback) {
    if(_.size(data[0]) > 0){
        User.findOneAndRemove({
            'id': data.id[0]
        }, function(err) {
            callback(err === null);
        });
    }
    
};

exports.mongoSave = function(data, callback) {
    callback(true);
    // User.findOneAndUpdate(
    //     {email : data.email},
    //     {$set : {
    //         email : data.login,
    //         telephone : data.phone,
    //         country_id : data.countryID,
    //         state_id : data.stateName,
    //         street : data.street,
    //         password_input : data.password,
    //         password : data.password,
    //         gender : data.gender,
    //         income_monthly : data.income_monthly,
    //         fullname :  data.name,
    //         avatar : data.avantar_link,
    //         day_of_birth: data.day_of_birth,
    //         year_of_birth: data.year_of_birth,
    //         month_of_birth: data.month_of_birth,
    //         signature : data.signature
    //     }},{
    //         upsert : true ,
    //         new : true
    //     }, function(err, results){
    //         callback(err === null);
    //     }
    // );
};


var setKNumber = function(_id, totalAmount, callback){
    User.update({
        _id : _id
    },{
        $set : { k_number : totalAmount }
    }, function(err, results){
        callback(err === null)
    });
};

var pushHistory = function(_id, dataHistory, callback){
    var message_content = '';
    _.each(dataHistory, function(data){
         User.update({
            _id : _id
        },{
            $push : {
                history_oder : {
                    date_create : new Date(),
                    payment_method : 'mua5k.com',
                    total_amount : data.type === '+' ? data.amount : data.amount * -1,
                    order_description : data.reason,
                    transaction_status : '00',
                    state : true
                }
            }
        }, function(err, results){
            !err && (
                ControlUser.updateNotifyMess([{ _id: _id }], 'my_wallet', function(result){
                    !_.isUndefined(process.socket) && (
                        process.socket.emit('customer:my_wallet', {
                            'partner_id': _id
                        }),
                        process.socket.broadcast.emit('customer:my_wallet', {
                            'partner_id': _id
                        })
                    ),
                    data.type === '+' ? (
                        message_content = 'Quý khách nhận được <'+data.amount+' K> từ Mua5K. Chúc Quý Khách mua sắm vui vẻ.'
                    ) : (
                        message_content = 'Quý khách bị trừ <'+data.amount+' K> bởi Mua5K. Chúc Quý Khách mua sắm vui vẻ.'
                    )
                    Notification10k.sendNotificationforOneUser(message_content, _id)
                })
            );
            callback(err === null);
        });
    });
   
}

var updateKNumberForUser = function(_id, amount, callback){
    User.findById(_id)
    .select({
        k_number : !0,
        _id : 0
    })
    .exec(function(err, results){
        !err ? (
            setKNumber(_id, results.k_number + amount, function(err){
                callback(err);
            })
        ) : (
            callback(err === null)
        )

    })
}

var fnSumAmount = function(obj, callback){
    var sum = 0;
    _.each(obj, function(value, key){
        sum = value.type === '+' ? sum + value.amount : sum - value.amount;
    })

    callback(sum);
};

exports.updateKNumber = function(data, callback){
    _.each(_.groupBy(data, 'website_id'), function(value, key){
        fnSumAmount(value, function(totalAmount){
            updateKNumberForUser(key, totalAmount, function(){});
            pushHistory(key, value, function(){});
        });
    });

    callback(true);

    
};

exports.updateNotifyMess = function(dataNotify, type, callback){
    var list_user = [],
        index = 1;
    _.each(dataNotify, function(data){
        User.update({
            _id : data._id
        },{
            $push : {
                notify_mess : {
                    id: data._id,
                    date_create : new Date(),
                    type : type,
                    state : false
                }
            }
        }, function(err, results){
            if (err === null) {
                list_user.push(data._id)
            }
            if (index == dataNotify.length) {
                callback(list_user);
            }
            index ++;
        });
    });
};

exports.updateNotifyMessFromRabbit = function(data, callback) {
    var list_user = [],
        customers = data.partner_ids,
        notify_id = data.notify_id,
        index = 1;
    Notify.findOne({
        id: notify_id
    }, function(err, results){
        !err && results ? (
            _.each(customers, function(customer_id){
                User.update({
                    _id : customer_id
                },{
                    $push : {
                        notify_mess : {
                            id: customer_id,
                            date_create : new Date(),
                            type : 'other',
                            notify_id: data.notify_id,
                            state : false
                        }
                    }
                }, function(err, result){
                    if (err === null) {
                        list_user.push(customer_id)
                    }
                    if (index == customers.length) {
                        !_.isUndefined(process.socket) && (
                            setTimeout(function() {
                                process.socket.emit('customer:new_notify', {
                                    list_user: list_user
                                }),
                                process.socket.broadcast.emit('customer:new_notify', {
                                    list_user: list_user
                                })
                            }, 500)
                        );
                        var message_content  = "Mua5K gửi bạn thông báo mới. XEM NGAY!";
                        results.type_notify === 'once' && list_user && (
                            Notification10k.sendNotificationforOneUser(message_content, list_user[0])
                        );
                        results.type_notify === 'many' && (
                            Notification10k.sendNotificationforManyUser(message_content, list_user)
                        );
                        results.type_notify === 'all' && (                            
                            // Notification10k.sendNotificationforAllUser(message_content)
                            Notification10k.sendNotificationforManyUser(message_content, list_user)
                        );
                        callback(true);
                        return;
                    }
                    index++;
                });
            })
        ) : (
            callback(false)
        )
    });
};