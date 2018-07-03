// 'use strict';
// var _ = require('lodash');

// var crypto = require('crypto');
// var fs = require('fs');
// var path = require('path');
// var soap = require('soap');
// var vnptepay = require('./vnptepay');
// var config = require('./config/environment');
// var User = require('../node_amqplib/node_mongodb/res_user/model.res.user');
// var ControlUser = require('../node_amqplib/node_mongodb/res_user/controller.res.user');
// var WebsiteTransactionK_error = require('../node_amqplib/node_mongodb/res_user/model.website.transactionk.error');
// var publisher = require("../node_amqplib/lib_publisher");

// var topUp = function (data, user, res) {
// 	soap.createClient(config.vnptepay.ws_url, {}, function(err, client) {
// 		if (!err) {
// 			//tru tien truoc khi goi topup, neu loi se cong so tien vao lai
// 			User.update({
// 			    _id: user._id
// 			}, {
// 				k_number: user.k_number - (data.amount / 1000)
// 			}, function(err, result1) {
// 				if (!err) {
// 					client.topup(data, function(err, result, raw, soapHeader) {
// 						if (result.topupReturn) {
// 							var errorCode = result.topupReturn.errorCode.$value;
// 							var message = result.topupReturn.message.$value;
// 							var datenow = new Date();
// 							var hrTime = process.hrtime();
// 					        var mcTime = hrTime[0] * 1000000 + hrTime[1] / 100;
// 					        mcTime = mcTime.toString().split('.'), mcTime = mcTime[1];
// 							if (errorCode == 0) {
// 								User.update({
// 								    _id: user._id
// 								}, {
// 								    $push: {
// 								        history_topup: {
// 								            date_create: datenow,
// 								            payment_method: 'TOPUP',
// 								            total_amount: '-' + data.amount,
// 								            order_description: "Nạp tiền trực tiếp TopUp cho " + data.target + " mệnh giá " + data.amount + " đ",
// 								            code: errorCode,
// 								            message: message,
// 								            state: true
// 								        }
// 								    }
// 								}, function(err, result) {
// 									var data_push = null;
// 								    !err ? (
// 								        ControlUser.updateNotifyMess([{
// 								            _id: user._id
// 								        }], 'my_wallet', function(result) {
// 								            !_.isUndefined(process.socket) && (
// 								                process.socket.emit('customer:my_wallet', {
// 								                    'partner_id': user._id
// 								                }),
// 								                process.socket.broadcast.emit('customer:my_wallet', {
// 								                    'partner_id': user._id
// 								                })
// 								            )
// 								        }),
// 								        data_push = {
// 								            partner_id: [user._id, user.email],
// 								            amount: data.amount / 1000,
// 								            date_exchange: datenow,
// 								            type_exchange: 'subtraction',
// 								            millisecond: parseInt(mcTime)
// 								        },
// 								        publisher.publisher('website_transactionK', data_push, function(cb) {
// 								            //neu err save err to website_transactionK
// 								            !cb && (
// 								                new websiteTransactionK_error(data_push).save(function(err, result) {})
// 								            )
// 								            return res.status(200).send();

// 								        })
// 								    ) : (
// 								        res.status(403).send({message_err: 'Lỗi khi cập nhật thông tin khách hàng.'})
// 								    )
// 								});
// 							// } else if (errorCode == 23 || errorCode == 99) {
// 							// 	return res.status(200).send({message_warn: message});
// 							} else {
// 								User.update({
// 								    _id: user._id
// 								}, {
// 								    $push: {
// 								        history_topup: {
// 								            date_create: datenow,
// 								            payment_method: 'TOPUP',
// 								            total_amount: '-' + data.amount,
// 								            order_description: "Nạp tiền trực tiếp TopUp cho " + data.target + " mệnh giá " + data.amount + " đ",
// 								            code: errorCode,
// 								            message: message,
// 								            state: false
// 								        }
// 								    },
// 								    k_number: user.k_number + (data.amount / 1000)
// 								}, function(err, result) {
// 									return res.status(403).send({message_err: message});
// 								});
// 							}
// 						} else {
// 							return res.status(403).send(result.body);
// 						}
// 					});
// 				} else {
// 					return res.status(403).send({message_err: 'Xảy ra lỗi trong quá trình giao dịch.'});
// 				}
// 			});
// 		} else {
// 			return res.status(403).send({message_err: 'Xảy ra lỗi trong quá trình giao dịch.'});
// 		}
// 	});
// }

// exports.sign = function(data_sign, user, res) {
// 	var sign = crypto.createSign('SHA1');
// 	var signature = false;
// 	fs.readFile(path.join(__dirname, 'config/VNPTEPAYKEY/private_key.pem'), 'utf-8', function(err, data) {
// 		if (!err) {
// 			var sign_str = data_sign.requestId + data_sign.partnerName + data_sign.provider + data_sign.target + data_sign.amount;
// 			sign.update(sign_str);
// 			signature = sign.sign(data, 'base64');
// 			data_sign.sign = signature;
// 			topUp(data_sign, user, res);
// 		} else {
// 			return res.status(403).send(err);
// 		}
// 	});
// }