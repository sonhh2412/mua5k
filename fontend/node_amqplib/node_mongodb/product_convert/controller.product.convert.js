"use strict";
var Product = require('../product_product/model.product.product');

var _ = require('lodash');





exports.mongoSave = function(data, callback) {
    for (var i = data.product_ids.length - 1; i >= 0; i--) {
        Product.findOne({
            id : data.product_ids[i]
        }, function(err, product){
            if(product){

                Product.update({
                    _id : product._id
                },
                {
                    $set : {
                        convert : [{name : data.name, amount : data.amount}]
                    }
                }, function(err, result){
                    // console.log(err);
                })   
            }            
            // product.update(product, function(err, update){
            //     console.log(update);
            // });
        })
    };
    callback(true);
};

