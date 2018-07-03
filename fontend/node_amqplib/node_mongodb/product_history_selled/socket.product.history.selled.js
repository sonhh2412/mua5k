'use strict';

var Product_History = require('./model.product.history.selled');

module.exports = function(socket) {
    Product_History.schema.post('save', function(doc) {
	  	Product_History.aggregate(
	  			{ $group: { _id : null, sum : { $sum: "$code" } } }
	  		).exec(function(err, result){
		  		!err && (
		  	
		  			socket.emit('product:count', result[0].sum),
	     			socket.broadcast.emit('product:count', result[0].sum),

	     			Product_History.find({

					})
					.sort({'date_add' : -1})
					.limit(10)
					.exec(function (err, results) {
						!err && (
	     					socket.emit('product:hook_list', results),
	     					socket.broadcast.emit('product:hook_list', results)
	     				)
					})     			
				)

			})
	})
};