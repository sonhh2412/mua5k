'use strict';
var _ = require('lodash');
var express = require('express'), app = express();

var mongoose = require('mongoose');
mongoose.connect('mongodb://adminMua5k:AdminMua5k#$%@127.0.0.1:27017/10k_mua_68');
var User = require('../node_amqplib/node_mongodb/res_user/model.res.user');
var ControlUser = require('../node_amqplib/node_mongodb/res_user/controller.res.user');
var Notification5k = require("../server/api/user/notification");

var publisher = require("../node_amqplib/lib_publisher");

var websiteTransactionK_error = require('../node_amqplib/node_mongodb/res_user/model.website.transactionk.error');

var getKnumberVMG = function(totalAmount){
//    totalAmount = 10;
    switch (totalAmount) {
        case 1:
            return 1000
        break;
        case 2:
            return 2000
        break;
        case 3:
            return 3000
        break;
        case 4:
            return 4000
        break;
        case 5:
            return 5000
        break;
        case 10:
            return 10000
        break;
        case 15:
            return 15000
        break;
        case 20:
            return 20000
        break;
        case 30:
            return 30000
        break;
        case 40:
            return 40000
        break;
        case 50:
            return 50000
        break;
        case 100:
            return 100000
        break;
    }
};


var processPost = function(request, response, callback) {
    var queryData = "";
    if(typeof callback !== 'function') return null;

    if(request.method == 'POST') {
        request.on('data', function(data) {

            queryData += data;
            if(queryData.length > 1e6) {
                queryData = "";
                response.writeHead(413, {'Content-Type': 'text/plain'}).end();
                request.connection.destroy();
            }
        });

        request.on('end', function() {

            request.post = JSON.parse(queryData);
            callback();
        });

    } else {
        response.writeHead(405, {'Content-Type': 'text/plain'});
        response.end();
    }
}

var processNotify = function(request, response, callback){

    var datenow = new Date();
    var hrTime = process.hrtime();
    var mcTime = hrTime[0] * 1000000 + hrTime[1] / 100;
    mcTime = mcTime.toString().split('.'), mcTime = mcTime[1];
    var data_push = {};
    // if (request.connection.remoteAddress === '103.68.240.14') {
        _.size(request.post) === 9
            && !_.isUndefined(request.post.transactionNo) 
            && !_.isUndefined(request.post.contentCode) 
            && !_.isUndefined(request.post.totalAmount)
            && !_.isUndefined(request.post.account)
            && !_.isUndefined(request.post.isdn)
            && !_.isUndefined(request.post.result)
            && !_.isUndefined(request.post.mode)
            && !_.isUndefined(request.post.SyncUrl) ? (

            //ket qua tru tien thanh cong hay that bai

            parseInt(request.post.result) === 1 ? (

                User.findOne({
                    $or : [
                        { email: request.post.account.toLowerCase()},
                        { telephone : request.post.account.toLowerCase()}
                    ]
                    
                }, function(err, user) {
                    if(!err && _.size(user) > 0){
                        // var totalAmount = getKnumberVMG(parseInt(request.post.totalAmount));
                        var totalAmount = parseInt(request.post.totalAmount);
                        // if(totalAmount < 10000){
                        if(totalAmount <= 0){
                            callback(false);
                        }else{
                            var k_number = totalAmount / 1000 * 0.5;
                            user.k_number += k_number;
                            User.update ( {
                                _id : user._id
                             }, {
                                $push : {
                                    history_oder : {
                                        date_create : datenow,
                                        payment_method : 'Nạp qua sđt: '+ request.post.isdn.replace('84','0'),
                                        total_amount : '+' + (k_number).toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1."),
                                        order_description : "Mệnh giá: "+parseInt(request.post.totalAmount).toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1.")+" đ",
                                        transaction_status : '00',
                                        state : true
                                    }
                                },
                                k_number : user.k_number
                             }, function(err, result) {
                                !err ? ( 
                                    ControlUser.updateNotifyMess([{ _id: user._id }], 'my_wallet', function(result){
                                        !_.isUndefined(process.socket) && (
                                            process.socket.emit('customer:my_wallet', {
                                                'partner_id': user._id
                                            }),
                                            process.socket.broadcast.emit('customer:my_wallet', {
                                                'partner_id': user._id
                                            })
                                        ),
                                        Notification5k.sendNotificationforOneUser('Bạn vừa nạp'+(k_number).toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1.")+' đ từ số điện thoại '+request.post.isdn.replace('84','0')+' ! ', user._id)
                                    }),
                                    data_push = {
                                        partner_id : [user._id, user.email],
                                        amount : k_number,
                                        date_exchange : datenow,
                                        type_exchange : 'addition',
                                        millisecond : parseInt(mcTime)
                                    },
                                    new websiteTransactionK_error(data_push).save(function(err, result){
                                        !err ? ( 
                                            callback(true), 
                                            console.log("Success user: "+ request.post.account+" total " + parseInt(request.post.totalAmount).toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1.") + "đ sdt: " + request.post.isdn.replace('84','0')) 
                                        )
                                        : (
                                            callback(false),
                                            console.log('Error When Push ' + err + ' User: ', request.post.account +" total " + parseInt(request.post.totalAmount).toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1.") + "đ sdt: " + request.post.isdn.replace('84','0'))
                                        );
                                    })

                                ) : (
                                    callback(false),
                                    console.log('Error When Update: ' + err + ' User: ', request.post.account +" total " + parseInt(request.post.totalAmount).toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1.") + "đ sdt: " + request.post.isdn.replace('84','0'))
                                );

                            })
                        }
                    }else{
                        callback(false);
                        console.log('Error When Find: ' + err + ' User: '+ request.post.account+" total " + parseInt(request.post.totalAmount).toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1.") + "đ sdt: " + request.post.isdn.replace('84','0'));
                    }
                })
            ) : (
                console.log("Error Result For User: "+ request.post.account+" total " + parseInt(request.post.totalAmount).toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1.") + "đ sdt: " + request.post.isdn.replace('84','0')),
                callback(false)
            )
            
        ) : (
            callback(false),
            console.log('Post request error: ', request.post)
        )
    // }else{
    //     callback(false)
    // }
};

app.use('/api/users/notifyMPayment/50787d031d0a57477b2a10318f1d0360', function(request, response){
     processPost(request, response, function() {
        processNotify(request, response, function(cb){
            var jsonSend = cb ? {Status: "0", Description: "success"} : {Status: 1, Description: "failure"}
            jsonSend = JSON.stringify(jsonSend);
            response.writeHead(200, {"Content-Type": "application/json"});
            response.end(jsonSend);
        });
        

    });
});


app.listen(9973, function(){
    console.log('Notify SMS running on port 9973');
})

    