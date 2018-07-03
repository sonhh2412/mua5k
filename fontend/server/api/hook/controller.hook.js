'use strict';

var Product_History = require('../../../node_amqplib/node_mongodb/product_history_selled/model.product.history.selled');


var strftime = require('strftime');

var _ = require('lodash');

function handleError(res, err) {
    return res.status(500).send(err);
}

exports.getCount = function(req, res){


	Product_History.aggregate(
	  			{ $group: { _id : null, sum : { $sum: "$code" } } }
	  		).exec(function(err, result){
	  			err || _.size(result) === 0 ? res.send([0]) : res.send([result[0].sum]);

			})
};

exports.getList = function (req, res) {

	Product_History.find({
		user_id: { $ne: ''}
	})
	.limit(10)
	.sort({'date_add' : -1})
	.exec(function (err, results) {
		!err ? res.send(results) : res.send([]);
	})
}