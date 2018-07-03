'use strict';

var _ = require('lodash');

var Product = require('../../../node_amqplib/node_mongodb/product_product/model.product.product');

// Get list of brands
exports.getBrand = function(req, res) {

    req.params.id % 1 === 0 && parseInt(req.params.id) !== 0 && (
        Product.aggregate([
        {
            $unwind: '$brand'
        }
        ,{
            $match : {
                "published": true,
                "session": { "$elemMatch": { "innerArray.0": { "$ne": [] } } },
                "session.finish": false,
                "category" : { "$elemMatch": { $eq: parseInt(req.params.id) } }
            }
        }
        ,{
            $group: {
                _id: {
                    'name': '$brand.name',
                    'id': '$brand.id'
                }
            }
        }
        ,{
            $sort: {
                '_id.id': -1
            }
        }])

        .exec(function(err, result) {
       
            err ? handleError(res, err) : res.send(result);
        })
    );

    req.params.id % 1 === 0 && parseInt(req.params.id) === 0 && (
        Product.aggregate([
        {
            $unwind: '$brand'
        }
        ,{
            $match : {
                "published": true,
                "session": { "$elemMatch": { "innerArray.0": { "$ne": [] } } },
                "session.finish": false
            }
        }
        ,{
            $group: {
                _id: {
                    'name': '$brand.name',
                    'id': '$brand.id'
                }
            }
        }
        ,{
            $sort: {
                '_id.id': -1
            }
        }])

        .exec(function(err, result) {
            err ? handleError(res, err) : res.send(result);
        })
    );
};

function handleError(res, err) {
  return res.status(500).send(err);
}
