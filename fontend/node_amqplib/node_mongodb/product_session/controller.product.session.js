"use strict";
var Product = require('../product_product/model.product.product');
var _ = require('lodash');


exports.mongoDelete = function(data, callback) {

    Product.update(
        { id : data.product_id }
        ,{
            $pull : {
                session : {session_id : { $in : data.id }, code : [] }
            }
        }
        ,{ multi: true }
    ).exec(function (err, result) {
        callback(err === null);
    });
};

exports.mongoSave = function(data, callback) {

    Product.count(
        {"session.session_id" : parseInt(data.session_id)}
    )
    .exec(function(err, count){
        if( count > 0 ){
            callback(true , data.session_id);
        }else{
            data.code = [];
            data.finish = false,
            data.selled = 0
            delete data['type'];

            var product_id = data.product_id;

            if(!data.product_id){
                callback(true , 0)
            }else{
                delete data['product_id'];

                Product.findOne(
                    { id : product_id }
                )
                .exec(function(err, product){
                    !err && product !== null ? (
                        data.number = _.size(product.session) > 0 ? _.size(product.session) + 1 : 1 ,
                        Product.update({id: product_id}, {$push : { session : data }}, function(err, update){
                            callback(err === null , product_id)
                        })
                    ) : (
                        product === null ? callback(true , product_id) : callback(false , product_id)
                    )
                })
            };
        }
    });
};
