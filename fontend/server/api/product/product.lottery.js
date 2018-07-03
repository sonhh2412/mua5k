'use strict';

var Product_Lottery = require('../../../node_amqplib/node_mongodb/product_session_lottery/model.product.session.lottery');

exports.getProductLotteryListUserbySession = function(product_info, callback) {
    Product_Lottery.aggregate([
        {
        $match : {
            id: parseInt(product_info.id),
            session_id: parseInt(product_info.session_id),
        }
        },
        {
            $project : {
                _id : 0,
                code : 1,
                session_id :1
            }
        },
        {
            $unwind : "$code"
        },
        {
            $group : {
                _id : '$code.user._id'
            }
        }
    ]).exec(function(err, results) {
      !err ? callback(results) : callback([]);
    });
};