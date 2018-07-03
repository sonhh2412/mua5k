'use strict';

exports.getProductNewHomePage = function(req, res) {
	 	require('../../../node_amqplib/node_mongodb/product_product/model.product.product').aggregate ([
		{
			$match : {
				"published" : true,
				"session" : { "$elemMatch": { "innerArray.0": { "$ne": [] } } },
				"session.finish" : false,
				"convert" : { "$elemMatch": { "innerArray.0": { "$ne": [] } } },
			}
		},
		{
			$sort : {id : -1}
		}
		,{
			$limit : 8
		}
		,{
			$project : {
				name : !0,
				slug : !0,
				images : !0,
				price : !0,
				published : !0,
				convert: !0,
				limited : !0,
			}
		}

	])
	.exec(function(err, results){
		return !err ? res.send(results) : res.status(500).send(err);
	})
}