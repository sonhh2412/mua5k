'use strict';

var Product = require('../../../node_amqplib/node_mongodb/product_product/model.product.product');
var _ = require('lodash');


exports.sessionSelling = function(product_id, project, callback) {
    Product.aggregate ([
        { '$unwind' : '$session' },
        {
            $match : {
                'id' : {$eq : parseInt(product_id)} ,
                'published' : true,
                'session.finish' : false
            }
        }
        ,{
            $sort : {
                "session.number" : 1
            }
        }
        ,{
            $limit : 1
        }
        ,{
            $project : project
        }
    ])
    .exec(function(err, result){
        err === null ? callback(result) : callback([]) ;        
    })
};

exports.sessionCartSelling = function(product_id, project, callback) {

    Product.findOne({
        _id : product_id
    }, function(err, result){
        !err && result !== null ? (
            Product.aggregate ([
                { '$unwind' : '$session' },
                {
                    $match : {
                        'id' : {$eq : result.id} ,
                        'session.finish' : false
                    }
                }
                ,{
                    $sort : {
                        "session.number" : 1
                    }
                }
                ,{
                    $limit : 1
                }
                ,{
                    $project : project
                }
            ])
            .exec(function(err, result){
                err === null ? callback(result) : callback([]) ;        
            })
        ) : (
            callback([])
        )
    });
    
};


exports.sessionCartSelled = function(product_id, project, callback) {

    Product.aggregate ([
        { '$unwind' : '$session' },
        {
            $match : {
                'id' : {$eq : parseInt(product_id)} ,
                'session.finish' : true
            }
        }
        ,{
            $sort : {
                "session.session_id" : -1
            }
        }
        // ,{
        //     $limit : 8
        // }
        ,{
            $project : project
        }
    ])
    .exec(function(err, result){
        err === null ? callback(_.map(result, function(value){return {number : value.session.number , session_id: value.session.session_id} })) : callback([]) ;        
    })
    
};

exports.sessionSelectSharing = function(product_id, project, callback){
    Product.findOne({
        _id : product_id
    }, function(err, result){
        Product.aggregate ([
            { '$unwind' : '$session' },
            {
                $match : {
                    'id' : {$eq : result.id}
                }
            }
            ,{
                $project : project
            }
        ])
        .exec(function(err, result){
            err === null ? callback(result) : callback([]) ;        
        })
    });
};

exports.CustomerSharingbySession = function(product_id, session_id, session_number, callback){
    Product.findOne({
        _id : product_id
    }, function(err, result){
        Product.aggregate ([
            { $match : {
                            id : {$eq: result.id},
                        }
            }
            ,{ $unwind : '$session'}
            ,{ $match : { 'session.session_id': { $eq : parseInt(session_id)} } }
            ,{ $project: {
                code_s: '$session.code',
                _id: 0
            }}
            ,{ $unwind: '$code_s'}
            ,{ $unwind : '$code_s.code'}
            ,{ $group: {
                _id : { user_name: '$code_s.user.user_name', 'region': '$code_s.user.region', 'avatar': '$code_s.user.avatar', 'id': '$code_s.user._id'},
                count: { $sum: 1}
            }}
        ])
        .exec(function(err, result){
            err === null ? callback(result) : callback([]) ;        
        })
    });
};

exports.searchSessionSelledByNumber = function(product_id, number, project, callback) {
    Product.findOne({
        id : parseInt(product_id)
    }, function(err, result){
        Product.aggregate ([
            { '$unwind' : '$session' },
            {
                $match : {
                    'id' : {$eq : result.id},
                    'session.number' : { $eq : parseInt(number) },
                    // 'session.finish' : true
                }
            }
            ,{
                $project : project
            }
        ])
        .exec(function(err, result){
            err === null ? callback(result) : callback([]) ;        
        })
    });
};

exports.getSessionSelling = function(product_id, project, callback) {
    Product.findOne({
        id : parseInt(product_id)
    }, function(err, result){
        Product.aggregate ([
            { '$unwind' : '$session' },
                {
                    $match : {
                        'id' : {$eq : result.id} ,
                        'session.finish' : false
                    }
                }
                ,{
                    $sort : {
                        "session.number" : 1
                    }
                }
                ,{
                    $limit : 1
                }
                ,{
                    $project : project
                }
        ])
        .exec(function(err, result){
            err === null ? callback(result) : callback([]) ;        
        })
    });
}