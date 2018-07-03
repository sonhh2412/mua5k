'use strict';

var Product = require('../../../node_amqplib/node_mongodb/product_product/model.product.product');
var Product_Lottery = require('../../../node_amqplib/node_mongodb/product_session_lottery/model.product.session.lottery');
var Product_History = require('../../../node_amqplib/node_mongodb/product_history_selled/model.product.history.selled');
var User = require('../../../node_amqplib/node_mongodb/res_user/model.res.user');
var ControlUser = require('../../../node_amqplib/node_mongodb/res_user/controller.res.user');
var publisher = require("../../../node_amqplib/lib_publisher");
var strftime = require('strftime');
var errOrderSessionPushOdoo = require("../../../node_amqplib/node_mongodb/product_session/model.product.session.order.error");
var Notification5k = require("../user/notification");
var _ = require('lodash');
var mongoose = require('mongoose');

function handleError(res, err) {
    return res.status(500).send(err);
}


var findProduct = function(product_id, callback) {
    var match = {
        "id": parseInt(product_id),
        "published": true,
        "session": {
            "$elemMatch": {
                "innerArray.0": {
                    "$ne": []
                }
            }
        },
        "session.finish": false,
        "convert": {
            "$elemMatch": {
                "innerArray.0": {
                    "$ne": []
                }
            }
        },
    };
    Product.aggregate([{
            $match: match
        }])
        .exec(function(err, results) {
            callback(err, results);
        });
};

exports.getCheckoutLimit = function(req, res){
    Product_Lottery.find({
        limited : true,
        lottery : true
    })
    .sort({
        date : -1,
    })
    .limit(1)
    .select({
        _id : 0,
        array_byer : 0,
        __v : 0,
        default_code : 0,
        description : 0,
        id : 0,
        limited : 0,
        total : 0,
        date : 0,
        convert : 0,
        images : 0,
        descriptionSale : 0,
        lottery : 0,
        price: 0,

    })
    .exec(function(err, result){

        if(err){
            res.send([]);
        }else{
            if(_.size(result) === 0){
                return res.send([])
            }
            var number_buyer = 0;
            var username = null;
            _.each(result[0].code, function(value){
                value.user._id.toString() === result[0].user_win[0]._id.toString() && (number_buyer = _.size(value.code));
            }); 

            User.findById(result[0].user_win[0]._id, function(err, user){
                err ? res.send([]) : (
                    username = user.fullname !== '' ? user.fullname : user.email,

                    res.send([{
                        username : username,
                        number_buyer : number_buyer,
                        winner_id : result[0].user_win[0]._id,
                        product : {
                            slug : result[0].slug,
                            name : result[0].name,
                            session_number : result[0].session_number,
                            session_id : result[0].session_id
                        }
                    }])
                );
            })
        }
        
    });
};

exports.findProductBy_ID = function(req, res) {



    var product_id = req.params._id;
    var match = {
        "_id": mongoose.Types.ObjectId(product_id),
        "published": true,
        "session": {
            "$elemMatch": {
                "innerArray.0": {
                    "$ne": []
                }
            }
        },
        "session.finish": false,
        "convert": {
            "$elemMatch": {
                "innerArray.0": {
                    "$ne": []
                }
            }
        },
    };
    Product.aggregate([{
            $match: match
        }])
        .exec(function(err, results) {
            err || _.size(results) <= 0 ? res.status(403).send("not_published") : res.send(results[0])
        });
};

var getQtySelling = function(_id, callback) {

    var project = {
        'session.number': !0,
        'session.selled': !0,
        'session.total': !0,
        'session.code': !0,
        'session.session_id': !0,
        'convert': !0,
        '_id': 0
    };
    require('../product/product.session.selling').sessionCartSelling(_id._id, project, function(session) {

        callback(session)
    })
};

// var addSessionCode = function(user, countCode){
//  return {
//      user : { _id : user._id, avatar : user.avatar, ip : user.ip, region : user.region },
//      code : 100000000 + countCode
//  };
// };

var fnGetTime = function(time) {
    time = strftime('%F %T', time);
    var hrTime = process.hrtime();
    var mcTime = hrTime[0] * 1000000 + hrTime[1] / 1000;
    mcTime = mcTime.toString().split('.'), mcTime = mcTime[1] ? mcTime[1] : 0;
    time = time + '.' + mcTime;
    return time;
};

var finalKNumber = function(user_id, k_number, callback) {   
    var number = 0;
    User.findById(user_id, function(err, result) {
        err ? callback(err !== null) : (
            // console.log(result.k_number, k_number),
            k_number = result.k_number - k_number,

            User.update({
                _id: result._id
            }, {
                $set: {
                    k_number: k_number
                }
            }, function(err, result) {
                callback(err === null);
            })
        )
    })
}

var AddKNumber = function(user_id, k_number) {   
    var number = 0;
    User.findById(user_id, function(err, result) {
        !err && (
            k_number = result.k_number + k_number,

            User.update({
                _id: result._id
            }, {
                $set: {
                    k_number: k_number
                }
            }, function(err, result) {
               
            })
        )
    })
}

var checkKOfUser = function(user, product_id, qty, callback) {

    findProduct(product_id, function(err, results) {
        if(!err && _.size(results) === 0){
            callback(true, -100);
        }else{
            err && results !== null ? callback(false, 0) : (
                getQtySelling(results[0], function(results) {
                    (user.k_number)  >= ((results[0].convert[0].amount / 1000) * qty) ? callback(true, (results[0].session.total - results[0].session.selled)) : callback(false, 0)
                })
            )
        }
        
    });

};

var checkKOfUserCart = function(product_id, callback) {
    findProduct(product_id, function(err, results) {
        if(!err && _.size(results) === 0){
            callback(true, -100);
        }else{
            err && results !== null ? callback(false, 0) : (
                getQtySelling(results[0], function(results) {
                    callback(true, (results[0].session.total - results[0].session.selled))
                })
            )
        }
        
    });

};

var pushToRabbit = function(order) {
    publisher.publisher('website_order_point', order, function(cb) {
        !cb && (
            new errOrderSessionPushOdoo({
                session_id: order.session_id,
                code: order.code,
                time: order.time,
                user_order: order.user_order,
            }).save(function(err, result) {

            })
        )
    })
};

var getCountBuyInSession = function(product_slug, session_id, user_id, callback){
    var match = {
        product_slug: product_slug,
        session_id: session_id,
        user_id: String(user_id)
    };
    Product_History.aggregate([{
        $match : match
    },
    {
        $group : {
            _id: null,
            count: { $sum: "$code"}
        }
    }])
    .exec(function(err, results) {
        callback(err, results);
    });
};

exports.getCountUserBuyInSession = function(req, res) {
    var product = null,
        product_id = req.params.product_id,
        user_id = req.user._id;
    findProduct(product_id, function(err, results) {

        err || _.size(results) === 0 ? res.status(403).send("Forbidden") : (
            product = results[0],
            getQtySelling(product, function(results) {
                _.size(results) === 0 ? res.status(403).send("Forbidden") : (
                    getCountBuyInSession(product.slug, results[0].session.session_id, user_id, function(err, results){
        
                        err ? res.status(403).send("Forbidden") : (
                            _.size(results) === 0 ? res.status(200).send({count:0}) : res.status(200).send(results[0])
                        )
                    })
                )
            })
        )
    });
};

var checkCountBuyInSession = function(product, qtyBuy, user_id, callback) {
    if (product.limited) {
        getQtySelling(product, function(results) {
            _.size(results) === 0 ? callback("Forbidden", null) : (
                getCountBuyInSession(product.slug, results[0].session.session_id, user_id, function(err, results){
                    err || _.size(results) === 0 ? (
                        qtyBuy > 5 ? callback({messerr: 1, alertmsg: "Bạn chỉ có thể mua 5 mã cho sản phẩm "+product.name+" thuộc khu vực hạn chế !"}, null) : callback(null, qtyBuy)
                    ) : (
                        results[0].count >= 5 ? callback({messerr: 2, alertmsg: "Bạn đã mua 5 mã cho sản phẩm "+product.name+". Không thể mua thêm nữa!"}, null) : (
                            qtyBuy > 5 - results[0].count ? (
                                callback({messerr: 3, alertmsg: "Bạn chỉ có thể mua thêm " + (5 - results[0].count) + " mã cho sản phẩm "+product.name+"!"}, null)   
                            ) : (
                                callback(null ,qtyBuy)
                            )
                        )
                    );
                })
            )
        });
    } else {
        callback(null, qtyBuy)
    }
};

var randomIntFromInterval = function(min, max){
    return Math.floor(Math.random()*(max-min+1)+min);
};


exports.checkountOne = function(req, res) {

    var tmp = randomIntFromInterval(1500, 4000);
    setTimeout(function() {
        var timeout = new Date();
        // console.log(req.params.index_cart, timeout.getTime());
        User.findById(req.user._id, function(err, result) {
            if(!err && _.size(result) === 0){
                res.status(403).send("Forbidden");
            }else{
                req.user = result;

                checkKOfUser(req.user, req.params.product_id, parseInt(req.params.qty) ,function(callback, qtyProduct) {

                    if (callback) {
                        if(qtyProduct === -100){
                            return res.status(403).send("not_published")
                        }
                        var product_id = req.params.product_id,
                            qty = req.params.qty <= qtyProduct ? req.params.qty : qtyProduct,
                            product = null,
                            session = null,
                            amountK = null,
                            amountTotal = null,
                            user = null,
                            code = null,
                            arrayQty = [],
                            time = null,
                            socketSession = null,
                            order = {},
                            arrayCode = [];
                        for (var i = 0; i < qty; i++) {
                            arrayQty.push(i);
                        }

                        product_id % 1 === 0 && qty % 1 === 0 ? (

                            time = fnGetTime(timeout),

                            findProduct(product_id, function(err, results) {

                                if(err) { return res.status(403).send("Forbidden") }
                                _.size(results) === 0 ? (
                                    res.status(403).send("not_session")
                                ) : (
                                    product = results[0],
                                    checkCountBuyInSession(product, qty, req.user._id, function(err, result){
                                        err && !result ? (
                                            res.status(403).send(err)
                                        ) : (
                                            //save to history product selled
                                            qty = result,
                                            new Product_History({
                                                product_slug: results[0].slug,
                                                product_name: results[0].name,
                                                product_image: _.size(results[0].images) > 0 ? results[0].images[0].image : '',
                                                time: time,
                                                user_name: req.user.fullname === '' ? req.user.email : req.user.fullname,
                                                user_id: req.user._id,
                                                user_avatar: req.user.avatar,
                                                code: parseInt(qty)
                                            }).save(function(err, save) {
                                                !err ? (
                                                    product_id = results[0],

                                                    getQtySelling(product_id, function(results) {
                                                        _.size(results) === 0 ? res.status(403).send("Forbidden") : (
                                                            amountK = results[0].convert[0].amount,
                                                            session = results[0].session,
                                                            session.code = session.selled === 0 ? [] : session.code,

                                                            amountTotal = (amountK * qty) / 1000,
                                                            //update history cho trang lich su mua ban user

                                                            Product_History.update({
                                                                time: time,
                                                            }, {
                                                                $set: {
                                                                    session_id: session.session_id,
                                                                    k_number: amountTotal,
                                                                    session_number : session.number
                                                                }
                                                            }, function(err, result) {
                                                                !err ? (

                                                                    req.user.k_number >= amountTotal  ? (
                                                                        _.each(arrayQty, function(value) {
                                                                            arrayCode.push((session.selled + (value + 1)) + 100000000)
                                                                        }),

                                                                        user = {
                                                                            _id: req.user._id,
                                                                            avatar: req.user.avatar,
                                                                            ip: req.user.ip,
                                                                            region: req.user.region,
                                                                            user_name: req.user.fullname === '' ? req.user.email : req.user.fullname
                                                                        },
                                                                        socketSession = {
                                                                            user: user,
                                                                            time: time,
                                                                            code: arrayCode,
                                                                            time_buy: timeout
                                                                        },
                                                                        session.code.push(socketSession),

                                                                        session.selled = parseInt(session.selled) + parseInt(qty),

                                                                        session.finish = session.selled === session.total,

                                                                        //update session product
                                                                        Product.update({
                                                                            _id: product_id,
                                                                            'session.session_id': session.session_id
                                                                        }, {
                                                                            "$set": {
                                                                                "session.$.code": session.code,
                                                                                "session.$.selled": session.selled,
                                                                                "session.$.finish": session.finish
                                                                            }
                                                                        }, function(err, update) {

                                                                            err ? (res.status(403).send("Not K")) : (

                                                                                 //tru k number cua user
                                                                                finalKNumber(req.user._id, amountTotal, function(callback) {

                                                                                    !callback ? res.status(403).send("Forbidden") : (
                                                                                        session.selled === session.total ? (
                                                                                            product.code = session.code,
                                                                                            product.session_number = session.number,
                                                                                            product.session_id = session.session_id,
                                                                                            product.date = timeout.setMinutes(timeout.getMinutes() + 3),
                                                                                            product.total = session.total,
                                                                                            product.limited = product.limited,
                                                                                            delete product["_id"],
                                                                                            new Product_Lottery(product)
                                                                                            .save(function(err, save) {
                                                                                                !err ? (

                                                                                                    // setTimeout(function() {
                                                                                                    //     !_.isUndefined(process.socket) && (process.socket.emit('product:session_code', {
                                                                                                    //         slug: product_id.slug,
                                                                                                    //         session_code: socketSession
                                                                                                    //     }))
                                                                                                    // }, 4500),
                                                                                                    // setTimeout(function() {
                                                                                                    //     !_.isUndefined(process.socket) && (process.socket.broadcast.emit('product:session_code', {
                                                                                                    //         slug: product_id.slug,
                                                                                                    //         session_code: socketSession
                                                                                                    //     }))
                                                                                                    // }, 4500),
                                                                                                    require('../product/product.lottery.js').getProductLotteryListUserbySession({
                                                                                                        id: product.id, session_id: product.session_id
                                                                                                    }, function(results){
                                                                                                        ControlUser.updateNotifyMess(results, 'waiting_result', function(result){  
                                                                                                            var message_content = 'Phiên số "'+session.number+'" của sản phẩm "'+product.name+'" đã đủ người mua mã và bắt đầu đếm ngược. Vào Xem Ngay !!';
                                                                                                            Notification5k.sendNotificationforManyUser(message_content,result);
                                                                                                            setTimeout(function() {
                                                                                                                !_.isUndefined(process.socket) && (process.socket.emit('lottery:list_user', {
                                                                                                                    list_user: result,
                                                                                                                }))
                                                                                                            }, 500);
                                                                                                            setTimeout(function() {
                                                                                                                !_.isUndefined(process.socket) && (process.socket.broadcast.emit('lottery:list_user', {
                                                                                                                    list_user: result,
                                                                                                                }))
                                                                                                            }, 500);
                                                                                                        });
                                                                                                    }),
                                                                                                    res.send({
                                                                                                        qty : parseInt(qty),
                                                                                                        amountTotal : amountTotal
                                                                                                    })
                                                                                                ) : res.status(403).send("Forbidden")
                                                                                            })
                                                                                        ) : (
                                                                                            // setTimeout(function() {
                                                                                            //     !_.isUndefined(process.socket) && (process.socket.emit('product:session_code', {
                                                                                            //         slug: product_id.slug,
                                                                                            //         session_code: socketSession
                                                                                            //     }))
                                                                                            // }, 4500),
                                                                                            // setTimeout(function() {
                                                                                            //     !_.isUndefined(process.socket) && (process.socket.broadcast.emit('product:session_code', {
                                                                                            //         slug: product_id.slug,
                                                                                            //         session_code: socketSession
                                                                                            //     }))
                                                                                            // }, 4500),
                                                                                            res.send({
                                                                                                qty : parseInt(qty),
                                                                                                amountTotal : amountTotal
                                                                                            })
                                                                                        )
                                                                                    );
                                                                                }),

                                                                                // dong bo don hang diem odoo
                                                                                order.session_id = session.session_id,
                                                                                order.code = arrayCode,
                                                                                order.time = time,
                                                                                order.user_order = [req.user._id, req.user.email],

                                                                                pushToRabbit(order),


                                                                                !_.isUndefined(process.socket) && (process.socket.emit('product:buy', {
                                                                                    product_id: product_id,
                                                                                    selled: session.selled,
                                                                                    session_id: session.session_id
                                                                                })),

                                                                                !_.isUndefined(process.socket) && (process.socket.broadcast.emit('product:buy', {
                                                                                    product_id: product_id,
                                                                                    selled: session.selled,
                                                                                    session_id: session.session_id
                                                                                }))                                                                              

                                                                            )
                                                                        })
                                                                    ) : (
                                                                        res.status(403).send("Not K")
                                                                    )
                                                                ) : (
                                                                    res.status(403).send("Forbidden")
                                                                )
                                                            })

                                                        );

                                                    })
                                                ) : (
                                                    res.status(403).send("Forbidden")
                                                )
                                            })
                                        )
                                    })
                                )
                            })
                        ) : (
                            res.status(403).send("Forbidden")
                        );
                    } else res.status(403).send("Not K")
                });
            }
        });
    }, tmp);

};



exports.checkountAllCart = function(req, res) {
    var tmp = randomIntFromInterval(1500, 3000);
    setTimeout(function() {
        if(_.size(req.body) > 0){
            var total_k_cart = 0;
            // var num_checout_ok = 0;
            var index_tmp = 0;
            var result_checkout = {
                num_checout_ok: 0,
                list_error: []
            }
            var k_amount_err = 0;
            // var list_error = [];
            _.each(req.body, function(value) {
                var numk = value.quantity * 5;
                total_k_cart = total_k_cart + numk;
            });
            
            User.findById(req.user._id, function(err, user) {
                !err && user ? (
                    parseInt(total_k_cart) <= user.k_number ? (                    
                        finalKNumber(req.user._id, parseInt(total_k_cart), function(callback) {
                            !callback ? res.status(403).send("Forbidden") : (
                                _.each(req.body, function(itemcart) {
                                    var timeout = new Date();

                                    checkKOfUserCart( itemcart.id_ck ,function(callback, qtyProduct) {
                                        if (callback) {
                                            if(qtyProduct === -100 || itemcart.quantity > qtyProduct){
                                                result_checkout.list_error.push({id: itemcart.id_ck, qty: itemcart.quantity, status: 0});
                                                k_amount_err += itemcart.quantity * 5;
                                                if (req.body.length - 1 == index_tmp) {
                                                    res.status(200).send(result_checkout);
                                                }
                                                index_tmp += 1;
                                                return;
                                                // return res.status(403).send("not_published");
                                            }
                                            var product_id = itemcart.id_ck,
                                                qty = itemcart.quantity <= qtyProduct ? itemcart.quantity : qtyProduct,
                                                product = null,
                                                session = null,
                                                amountK = null,
                                                amountTotal = null,
                                                user = null,
                                                code = null,
                                                arrayQty = [],
                                                time = null,
                                                socketSession = null,
                                                order = {},
                                                arrayCode = [];
                                            for (var i = 0; i < qty; i++) {
                                                arrayQty.push(i);
                                            }

                                            product_id % 1 === 0 && qty % 1 === 0 ? (

                                                time = fnGetTime(timeout),

                                                findProduct(product_id, function(err, results) {

                                                    err || _.size(results) === 0 ? (
                                                        result_checkout.list_error.push({id: product_id, qty: qty, status: 0}),
                                                        k_amount_err += qty * 5,
                                                        req.body.length - 1 == index_tmp &&
                                                            res.status(200).send(result_checkout),
                                                        index_tmp += 1
                                                        // res.status(403).send("not_session")
                                                    ) : (
                                                        product = results[0],
                                                        checkCountBuyInSession(product, qty, req.user._id, function(err, result){
                                                            err && !result ? (
                                                                result_checkout.list_error.push({id: product_id, qty: qty, status: 0}),
                                                                k_amount_err += qty * 5,
                                                                req.body.length - 1 == index_tmp &&
                                                                    res.status(200).send(result_checkout),
                                                                index_tmp += 1
                                                                // res.status(403).send(err)
                                                            ) : (
                                                                //save to history product selled
                                                                qty = result,
                                                                new Product_History({
                                                                    product_slug: results[0].slug,
                                                                    product_name: results[0].name,
                                                                    product_image: _.size(results[0].images) > 0 ? results[0].images[0].image : '',
                                                                    time: time,
                                                                    user_name: req.user.fullname === '' ? req.user.email : req.user.fullname,
                                                                    user_id: req.user._id,
                                                                    user_avatar: req.user.avatar,
                                                                    code: parseInt(qty)
                                                                }).save(function(err, save) {
                                                                    !err ? (
                                                                        product_id = results[0],

                                                                        getQtySelling(product_id, function(results) {
                                                                            _.size(results) === 0 ? (
                                                                                // res.status(403).send("Forbidden")
                                                                                result_checkout.list_error.push({id: product_id, qty: qty, status: 0}),
                                                                                k_amount_err += qty * 5,
                                                                                req.body.length - 1 == index_tmp &&
                                                                                    res.status(200).send(result_checkout),
                                                                                index_tmp += 1
                                                                            ) : (
                                                                                amountK = results[0].convert[0].amount,
                                                                                session = results[0].session,
                                                                                session.code = session.selled === 0 ? [] : session.code,

                                                                                amountTotal = (amountK * qty) / 1000,
                                                                                //update history cho trang lich su mua ban user

                                                                                Product_History.update({
                                                                                    time: time,
                                                                                }, {
                                                                                    $set: {
                                                                                        session_id: session.session_id,
                                                                                        k_number: amountTotal,
                                                                                        session_number : session.number
                                                                                    }
                                                                                }, function(err, result) {
                                                                                    !err ? (
                                                                                        _.each(arrayQty, function(value) {
                                                                                            arrayCode.push((session.selled + (value + 1)) + 100000000)
                                                                                        }),

                                                                                        user = {
                                                                                            _id: req.user._id,
                                                                                            avatar: req.user.avatar,
                                                                                            ip: req.user.ip,
                                                                                            region: req.user.region,
                                                                                            user_name: req.user.fullname === '' ? req.user.email : req.user.fullname
                                                                                        },
                                                                                        socketSession = {
                                                                                            user: user,
                                                                                            time: time,
                                                                                            code: arrayCode,
                                                                                            time_buy: timeout
                                                                                        },
                                                                                        session.code.push(socketSession),

                                                                                        session.selled = parseInt(session.selled) + parseInt(qty),

                                                                                        session.finish = session.selled === session.total,

                                                                                        //update session product
                                                                                        Product.update({
                                                                                            _id: product_id,
                                                                                            'session.session_id': session.session_id
                                                                                        }, {
                                                                                            "$set": {
                                                                                                "session.$.code": session.code,
                                                                                                "session.$.selled": session.selled,
                                                                                                "session.$.finish": session.finish
                                                                                            }
                                                                                        }, function(err, update) {
                                                                                            err ? 
                                                                                                (
                                                                                                    result_checkout.list_error.push({id: product_id, qty: qty, status: 0}),
                                                                                                    k_amount_err += qty * 5,
                                                                                                    req.body.length - 1 == index_tmp &&
                                                                                                        res.status(200).send(result_checkout),
                                                                                                    index_tmp += 1
                                                                                                    // res.status(403).send("Not K")
                                                                                            ) : (
                                                                                                session.selled === session.total ? (
                                                                                                    product.code = session.code,
                                                                                                    product.session_number = session.number,
                                                                                                    product.session_id = session.session_id,
                                                                                                    product.date = timeout.setMinutes(timeout.getMinutes() + 3),
                                                                                                    product.total = session.total,
                                                                                                    product.limited = product.limited,
                                                                                                    delete product["_id"],
                                                                                                    new Product_Lottery(product)
                                                                                                    .save(function(err, save) {
                                                                                                        !err ? (                                                                                                           
                                                                                                            require('../product/product.lottery.js').getProductLotteryListUserbySession({
                                                                                                                id: product.id, session_id: product.session_id
                                                                                                            }, function(results){
                                                                                                                ControlUser.updateNotifyMess(results, 'waiting_result', function(result){  
                                                                                                                    setTimeout(function() {
                                                                                                                        !_.isUndefined(process.socket) && (process.socket.emit('lottery:list_user', {
                                                                                                                            list_user: result,
                                                                                                                        }))
                                                                                                                    }, 500);
                                                                                                                    setTimeout(function() {
                                                                                                                        !_.isUndefined(process.socket) && (process.socket.broadcast.emit('lottery:list_user', {
                                                                                                                            list_user: result,
                                                                                                                        }))
                                                                                                                    }, 500);
                                                                                                                });
                                                                                                            }),
                                                                                                           
                                                                                                            result_checkout.num_checout_ok += 1,
                                                                                                            req.body.length - 1 == index_tmp &&
                                                                                                                res.status(200).send(result_checkout),
                                                                                                            index_tmp += 1

                                                                                                            
                                                                                                        ) : (
                                                                                                            result_checkout.list_error.push({id: product_id, qty: qty, status: 0}),
                                                                                                            k_amount_err += qty * 5,
                                                                                                            req.body.length - 1 == index_tmp &&
                                                                                                                res.status(200).send(result_checkout),
                                                                                                            index_tmp += 1
                                                                                                        )
                                                                                                    })
                                                                                                ) : (
                                                                                                    
                                                                                                    result_checkout.num_checout_ok += 1,
                                                                                                    req.body.length - 1 == index_tmp &&
                                                                                                        res.status(200).send(result_checkout),
                                                                                                    index_tmp += 1
                                                                                                   
                                                                                                ),
                                                                                                
                                                                                                // dong bo don hang diem odoo
                                                                                                order.session_id = session.session_id,
                                                                                                order.code = arrayCode,
                                                                                                order.time = time,
                                                                                                order.user_order = [req.user._id, req.user.email],

                                                                                                pushToRabbit(order),


                                                                                                !_.isUndefined(process.socket) && (process.socket.emit('product:buy', {
                                                                                                    product_id: product_id,
                                                                                                    selled: session.selled,
                                                                                                    session_id: session.session_id
                                                                                                })),

                                                                                                !_.isUndefined(process.socket) && (process.socket.broadcast.emit('product:buy', {
                                                                                                    product_id: product_id,
                                                                                                    selled: session.selled,
                                                                                                    session_id: session.session_id
                                                                                                }))                                                                              

                                                                                            )
                                                                                        })
                                                                                        
                                                                                    ) : (
                                                                                        result_checkout.list_error.push({id: product_id, qty: qty, status: 0}),
                                                                                        k_amount_err += qty * 5,
                                                                                        req.body.length - 1 == index_tmp &&
                                                                                            res.status(200).send(result_checkout),
                                                                                        index_tmp += 1
                                                                                        // res.status(403).send("Forbidden")
                                                                                    )
                                                                                })

                                                                            );

                                                                        })
                                                                    ) : (
                                                                        result_checkout.list_error.push({id: product_id, qty: qty, status: 0}),
                                                                        k_amount_err += qty * 5,
                                                                        req.body.length - 1 == index_tmp &&
                                                                            res.status(200).send(result_checkout),
                                                                        index_tmp += 1
                                                                        // res.status(403).send("Forbidden")
                                                                    )
                                                                })
                                                            )
                                                        })
                                                    )
                                                })
                                            ) : (
                                                result_checkout.list_error.push({id: product_id, qty: qty, status: 0}),
                                                k_amount_err += qty * 5,
                                                req.body.length - 1 == index_tmp &&
                                                    res.status(200).send(result_checkout),
                                                index_tmp += 1
                                                // res.status(403).send("Forbidden")
                                            );
                                        } else  {
                                            result_checkout.list_error.push({id: itemcart.id_ck, qty: itemcart.quantity, status: 0});
                                            k_amount_err += itemcart.quantity * 5;
                                            
                                            if (req.body.length - 1 == index_tmp) {
                                                k_amount_err > 0 && AddKNumber(req.user._id, parseInt(k_amount_err));
                                                res.status(200).send(result_checkout);
                                            }
                                            index_tmp += 1;
                                            // res.status(403).send("Not K");
                                        }
                                    })  
                                })
                            )
                        })
                    ) : (
                        res.status(403).send("Not K")
                    )
                   
                ) : (
                    res.status(403).send("NotFoundUser")
                )
            })

        }else{
            res.status(403).send("NotCart")
        }
    }, tmp);
    
    
};