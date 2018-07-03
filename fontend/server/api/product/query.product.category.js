'use strict';

var Product = require('../../../node_amqplib/node_mongodb/product_product/model.product.product');
var _ = require('lodash');
var paginate = require('node-paginate-anything');


var functCount = function( match, callback) {
    Product.aggregate([
    		{ 
                $match:  match
            },
            { $group: { _id: null, count: { $sum: 1 } } },
        ])
        .exec(function(err, results) {
        	callback(err, results)
        })
};

var functFind =  function( match, queryParameters, project, callback) {

	Product.aggregate([
		{ $match: match },  { $sort: { id: -1 } }, { $skip: queryParameters.skip }, { $limit: queryParameters.limit },
        {
            $project: project
        },
    ])
    .exec(function(err, results) {

    	callback(err, results);        
    })
};

exports.getproductcategory = function(req, res, match ,callback) {

    var queryParameters = null;

    var project = {
    	name: !0,
        slug: !0,
        images: !0,
        price: !0,
        published: !0,
        limited : !0,
        convert: !0,
        id : !0
    };

    functCount(match , function(err, count){
		count = _.size(count) > 0 ?  count[0].count : 0;
		!err && count > 0 ? (
			functFind (match , paginate(req, res, count, 28), project, function(err, products){

				err ? callback ({ results: [], count: 0 }) : callback ({ results: products , count: count })
			})
		) : (
			callback ({ results: [], count: 0 })
		)
	})
};


exports.getproductcategoryHomeBuyFast = function(req, res, match ,callback) {
    var queryParameters = null;

    var project = {
        name: !0,
        slug: !0,
        images: !0,
        price: !0,
        published: !0,
        session: !0,
        limited : !0,
        convert: !0,
        id : !0,
        code_remain : { $subtract: [ "$session.total", "$session.selled" ] },
        code_rate : { $cond: [ { $eq: ["$session.total", 0] }, "0", { $divide : [ { $subtract: [ "$session.total", "$session.selled" ] }, "$session.total"] } ] }
    };

    var group = {
        _id : "$_id",
        name : { $first : "$name" },
        slug : { $first : "$slug" },
        images : { $first : "$images" },
        price : { $first : "$price" },
        published : { $first : "$published" },
        session : { $first : "$session" },
        limited : { $first : "$limited" },
        convert : { $first : "$convert" },
        id : { $first : "$id" },
    };

    Product.aggregate([
        { $match : match },
        { $unwind: "$session" },
        { $match : { "session.finish": false } },
        { $group : group
        },
        {
            $project: project
        },
        { $sort : { code_rate: 1, code_remain: 1 } },
        { $limit: parseInt(req.params.limit) }
    ])
    .exec(function(err, results) {
        err ? callback([]) : callback(results);
    })
};


var functFindHotHomePage =  function(match, project, callback) {
    Product.aggregate([
        { $match: match }, { $limit: 8 }, { $sort: { id: -1 } },
        {
            $project: project
        },
    ])
    .exec(function(err, results) {

        callback(err, results);        
    })
};


exports.getproducthothomepage = function(req, res, match ,callback) {

    var queryParameters = null;

    var project = {
        name: !0,
        slug: !0,
        images: !0,
        price: !0,
        published: !0,
        limited : !0,
        convert: !0,
        id : !0
    };

    functFindHotHomePage (match , project, function(err, products){
        err ? callback ([]) : callback (products)
    })
}