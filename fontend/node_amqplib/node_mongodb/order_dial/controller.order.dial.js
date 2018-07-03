"use strict";
var Order_dital = require('../order_dial/model.order.dial');
var ControlUser = require('../res_user/controller.res.user');
var Notification10k = require("../../../server/api/user/notification");
var Product = require('../product_product/model.product.product');

var _ = require('lodash');

exports.mongoSave = function(data, callback ) {
	var message_content = "";
	if(data.description){
		new Order_dital(data).save(function(err, results){
			!err && (
				ControlUser.updateNotifyMess([{ _id: data.partner_id }], 'winning_products', function(result){
					!_.isUndefined(process.socket) && (
						process.socket.emit('customer:order', {
							partner_id: data.partner_id,
			            }),
			            process.socket.broadcast.emit('customer:order', {
							partner_id: data.partner_id,
			            })
		            ),
		            Product.findOne({id:data.lines[0].product_id}, function(err, product) {
		            	!err && product && (
			            	message_content = 'CHÚC MỪNG!!! Bạn đã mua thành công sản phẩm "'+product.name+'". Vào nhận sản phẩm ngay!',
			            	Notification10k.sendNotificationforOneUser(message_content, data.partner_id)	
		            	)
		            })
		        })
			);
	        callback(err === null);
	    });
	}else{
		callback(true);
	}
    
};
