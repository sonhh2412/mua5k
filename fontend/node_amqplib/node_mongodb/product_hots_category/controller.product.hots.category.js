"use strict";

var Category = require('../product_public_category/model.product.public.category'),
	Product = require('../product_product/model.product.product');

exports.mongoCategoryProductIds = function(data, callback) {

    Product.find({
		id : {$in : data.hots } 
	})
	.select({
		name : !0, slug : !0, price : !0, images : !0, id : !0
	})
	.sort({
		sequence : 1
	})
	.exec(function(err, result){
		err ? callback (false) : (
			Category.findOneAndUpdate(
		        {id : data.category_id},
		        {$set :
		        	{ product_host_ids : result }
		        }, function(err, results){
		            callback(err === null);
		        }
		    )
		);
	});	
};