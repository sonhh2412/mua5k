'use strict';

var _ = require('lodash');
var product = require('../../../node_amqplib/node_mongodb/product_history_selled/model.product.history.selled');
var paginate = require('node-paginate-anything');

exports.listHistorySelled = function(req, res){
	var queryParameters = null;
    product.count({
 
    }, function(err, count){
      !err && count > 0 ? (
        queryParameters = paginate(req, res, count, 100),
        product.aggregate([
	      {
	          $project : { 
	            "time": 1,
	            "user_id": 1,
	            "user_name": 1,
	            "date_add": 1,
	            "code": 1,
	            "product_name": 1,
	            "product_slug":1
	          }
	      },
	      {   
	          $sort: {"date_add":-1} 
	      }
        ])
        .skip(queryParameters.skip)
        .limit(queryParameters.limit)
          .exec(function(err, results) {         
            !err ? res.send(results) : res.status(403).send();
          })
      ) : (
        res.send({results: [] , count: 0})
      )
    })
}

exports.GetHistorySellById = function(req, res){
	var user_id = req.params.id;
	
	var queryParameters = null;
    product.count({
 		user_id: user_id
    }, function(err, count){
      !err && count > 0 ? (
        queryParameters = paginate(req, res, count, 20),
        product.aggregate([
	      {
	          $project : { 
	            "time": 1,
	            "user_id": 1,
	            "user_name": 1,
	            "date_add": 1,
	            "code": 1,
	            "product_name": 1,
	            "product_slug":1,
	            "session_id" : 1
	          }
	      },
	      { $match: { user_id: user_id} },
	      {   
	          $sort: {"date_add":-1} 
	      }
        ])
        .skip(queryParameters.skip)
        .limit(queryParameters.limit)
          .exec(function(err, results) {
            !err ? res.send(results) : res.status(403).send();
          })
      ) : (
      	res.status(403).json({count : 0})
        // res.send({results: [] , count: 0})
      )
    })
}