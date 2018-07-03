'use strict';

var Category = require('../../../node_amqplib/node_mongodb/product_public_category/model.product.public.category');

var User = require('../../../node_amqplib/node_mongodb/res_user/model.res.user');
var _ = require('lodash');



function handleError(res, err) {
    return res.status(500).send(err);
}




var findParent = function(category_id, cb){
    Category.find({
        parent_id : category_id
    })
    .select({
        name: !0,
        slug: !0,
        sequence : !0,
        _id : 0
    })
    .exec(function(err, results) {

        cb(err, results);
    });
};

exports.getCategBuyFast = function(req, res){
    Category.find({
        parent_id : 0
    })
    .select({
        name: !0,
        slug: !0,
        sequence : !0,
        _id : 0
    })
    .limit(6)
    .exec(function(err, results) {
        err ? res.send([]) : res.send(results);
    });
};


exports.getCateg = function(req, res) {
    
    findParent( 0, function(err, results){
        !err ? res.status(200).json(results) : handleError(res, err);
    });
};

exports.getChild = function(req, res) {
    findParent( req.params.id, function(err, results){

        _.size(results) === 0 ? (
            Category.find({
                id : req.params.id
            })
            .exec(function(err, results){
     
                !err && _.size(results) > 0 ? findParent(results[0].parent_id, function(err, results){
                    !err ? res.json({noChild : true, results: results}) : handleError(res, err) 
                }) : (
                    handleError(res, err)
                )
            })
        ) : (
            !err ? res.json({noChild : false, results: results}) : handleError(res, err)
        );
    });
};


exports.getSlug = function(req, res){
    Category.find({
        slug : req.params.slug
    })
    .select({
        name: !0,
        slug: !0,
        sequence : !0,
        _id : 0
    })
    .exec(function(err, result){

        !err ? res.status(200).json(result) : handleError(res, err);
    });
}