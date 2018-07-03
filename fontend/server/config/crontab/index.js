'use strict';

var userSchema = require('../../../node_amqplib/node_mongodb/res_user/model.res.user');

var userErrorSchema = require('../../../node_amqplib/node_mongodb/res_user/model.res.user.error');

var userErrorLoginSchema = require('../../../node_amqplib/node_mongodb/res_user/model.res.user.error.login.history');

var userErrorKTranferSchema = require('../../../node_amqplib/node_mongodb/res_user/model.website.transactionk.error');

var errOrderSessionPushOdoo = require("../../../node_amqplib/node_mongodb/product_session/model.product.session.order.error");

var Product = require('../../../node_amqplib/node_mongodb/product_product/model.product.product');

var publisher = require('../../../node_amqplib/lib_publisher');

var Product_Lottery = require('../../../node_amqplib/node_mongodb/product_session_lottery/model.product.session.lottery');

var Product_History = require('../../../node_amqplib/node_mongodb/product_history_selled/model.product.history.selled');

var Error_Dial = require('../../../node_amqplib/node_mongodb/dial_result_error/model.dial.result.error');

var strftime = require('strftime');
var randomstring = require('randomstring');
var _ = require('lodash');


    


var publisher_error_k_tranfer = function(){
    userErrorKTranferSchema.find({}, function(err, all_error){
        !err && _.size(all_error) > 0 && (
            _.each(all_error, function(k_error, index){
                userSchema.findById(k_error.partner_id[0], function(err, users){
                    !err && users === null && (
                        k_error.remove()
                    );
                    !err && users && (
                        users.actived === true && (
                            publisher.publisher('website_transactionK', k_error, function(cb){
                                cb && k_error.remove();
                            })
                        )
                    );
                });
                
            })
        );
    })
}

var fnGetTime = function(time) {
    time = strftime('%F %T', time);
    var hrTime = process.hrtime();
    var mcTime = hrTime[0] * 1000000 + hrTime[1] / 1000;
    mcTime = mcTime.toString().split('.'), mcTime = mcTime[1] ? mcTime[1] : 0;
    time = time + '.' + mcTime;
    return time;
};

var countPeople = function(_id, callback){
    var match = {
        _id : _id
    };
    Product_Lottery.aggregate([
        { $match: match },
        { $unwind: '$code'},
        { $project : {_id : 0, user : '$code.user'} },
        { $group : {_id : "$user._id"}}
    ])
    .exec(function(err, results) {
        callback(_.size(results), err);
    });
};

var getIDLottery = function(callback){
    var match = {
        "user_win" : [],
    };
    Product_Lottery.aggregate([
        { $match: match },
    ])
    .exec(function(err, results) {
        err ? callback([]) 
        : callback(_.map(results, function(value){
            return value._id;
        }));
    })
};



var getAllLotterySystem = function(callback){
    Product_History.find({})
    .limit(50)
    .sort({'date_add' : -1})
    .select({_id : 0, product_slug : !0, product_name: !0, time : !0, user_name: !0, user_id: !0, code : !0, session_id : !0, session_number : !0})
    .exec(function (err, results) {
   
        !err ? callback(results, _.map(results, function(value) { return value.time})) : callback([])
    })
}

var getValLottery = function(_id, callback){
    var match = {
        _id : _id,
    };
    Product_Lottery.aggregate([
        { $match: match },
        { $unwind: '$code'},
        
        { $limit : 50 },
        {$project : {_id : !0, date : !0, user : '$code.user', codes : '$code.code', time: '$code.time' , total : !0,  session_id: !0, time_buy : '$code.time_buy'} },
        {$sort : {'time_buy' : -1}},
    ])
    .exec(function(err, results) {
        !err ? callback(results) : callback([])
    });
};

var updateFnLottery = function(){
    Product_Lottery.update({
        lottery : false,
        date : {$lt: new Date()} 
    } , {
        $set : {
            lottery : true
        }
    } , {
        multi : true
    } , function(err, results){
        if (!err) {
            Product_Lottery.count({
                user_win : { $ne : [] },
                lottery : true 
            }, function(err, number){
                !err && typeof process.socket != 'undefined' && (
                    process.socket.emit('product:hook_refresh_number', number),
                    process.socket.broadcast.emit('product:hook_refresh_number', number)
                )
            });
        }
    });
};

var createSession = function(){
    Product.aggregate ([
        { '$unwind' : '$session' },
        {
            $match : {
                'published' : true,
                'session.finish' : false,
            }
        },
        {   
            $group: { _id: { 'product': '$id' } , count : { $sum: 1}} 

        },
        {
            $match : {
               'count' : { $lt : 6}
            }
        },
        {
            $project : {
                _id : '$_id.product'
            }
        }
        
    ])
    .exec(function(err, result){
        publisher.publisher('website_product_session_add', _.map(result, function(value) { return value._id}), function(cb) {
            
        })
    })
}

var getUserWiner = function(){
    
    getIDLottery(function(lottery_ids){
        _.each(lottery_ids, function(id){

            getAllLotterySystem(function(allLoterySystem, timeAllLotterSystem){
                
                if(_.size(allLoterySystem) > 0){
                     getValLottery(id, function(arrLottery){

                        if(_.size(arrLottery) > 0){

                            var time = 0;
                            _.each(timeAllLotterSystem, function(value){
                                time = time + parseInt(value.split(' ')[1].replace('.','').replace(':','').replace(':',''));
                            });

                            var user_winner = null;
                            var winner_code = (time % arrLottery[0].total) + 100000001; 

                            for (var i = 0 ; i < arrLottery.length ; i++) {
                                for (var j = 0; j < arrLottery[i].codes.length; j++) {
                                    if (parseInt(arrLottery[i].codes[j]) === parseInt(winner_code)) {
                                        user_winner = {
                                            _id : arrLottery[i].user._id,
                                            time_buy : arrLottery[i].time,
                                            time_result : fnGetTime(new Date()),
                                            winner_code : winner_code,
                                            sum_time : time
                                        }

                                        userSchema.findById(user_winner._id, function(err, user){
                                            var addDefult = null;
                                            var address_id = user_winner._id;
                                            if(_.size(user.address) > 0){
                                                addDefult = _.find(user.address, function(value) {return value.default === true});
                                 
                                                address_id = addDefult.website_id;
                                            }
                                            var push_odoo = {
                                                session_id : arrLottery[0].session_id,
                                                winner_id : user_winner._id,
                                                number_win : user_winner.winner_code,
                                                start : user_winner.time_buy,
                                                end : user_winner.time_result,
                                                address_id : address_id
                                            };

                                            publisher.publisher('website_dial_result', push_odoo, function(cb){
                                                !cb && (
                                                    new Error_Dial(push_odoo).save(function(err, result) {
                                                        err !== null && (console.log('err dial ' + push_odoo))
                                                    })
                                                )
                                            })

                                        });
                                    
                                       

                                        break;
                                    };
                                    if (user_winner) break;
                                };
                            };

                            Product_Lottery.findOneAndUpdate({
                                _id : arrLottery[0]._id
                            } , {
                                $set: {
                                    user_win : user_winner,
                                    array_byer : allLoterySystem
                                }
                            }, function(err, results){
                            });
                        }
                    });
                }
            });
        })
    });
};

var pushErrorDial = function(){
    Error_Dial.find({},function(err, all_error){
        !err && all_error && (
            _.each(all_error, function(error, index){
                publisher.publisher('website_dial_result', error, function(cb){
                    cb && error.remove();
                })
            })
        );
    })
};


var addNumLuotThamGia = function() {
    new Product_History({
        product_slug: '',
        product_name: '',
        product_image: '',
        time: null,
        user_name: '',
        user_id: '',
        user_avatar: null,
        code: 5678
    }).save(function(err, result) {

    });
}

module.exports = function (schedule) {
    var rule = new schedule.RecurrenceRule();
    rule.hour = 23;
    rule.minute = 59;
    rule.second = 59;
    
    var i = schedule.scheduleJob(rule, function(){

        userSchema.update({},{
            count_sms_day : 0
        }, {multi : true}, function(err, result){
            // console.log(err);
        })

        // addNumLuotThamGia();

    });
    
	var j = schedule.scheduleJob('*/1 * * * *', function(){
        pushErrorDial();
    //tim user chien thang trong moi phien san pham
       
        getUserWiner();
        updateFnLottery();
        
        // khong su dung create tao session tren website
        // createSession();

        publisher_error_k_tranfer();

		// remove user not input code

  		userSchema.find({
			timeout : {$lt: new Date()},
			actived : false
		}, function(err, users){
			_.each(users, function(user, index){
                process.socket.emit('user:remove', user);
                process.socket.broadcast.emit('user:remove', user);
                user.remove();
			});
		});

        userSchema.update({
            timeout_fogot_passwd : {$lt: new Date()},
        }, {
            timeout_fogot_passwd : undefined,
        },{multi : true}, function(err, result){
            // console.log(err);
        })

  		//push when rabbit mq error for res_user_error

  		userErrorSchema.find(function(err, all_error){
  			!err && all_error && (
  				_.each(all_error, function(user_error, index){
  					publisher.publisher('website_customer', user_error, function(cb){
				        cb && user_error.remove();
				    })
  				})
  			);
  		});

      //push len rabbilt neu nhu bo loi login history
  		userErrorLoginSchema.find(function(err, all_error){
  			!err && all_error && (
  				_.each(all_error, function(user_error, index){

  					publisher.publisher('website_login_history', user_error, function(cb){
				        cb && user_error.remove();
				    })
  				})
  			);
  		});

      //push len rabbit neu nhu bi loi order session 

      errOrderSessionPushOdoo.find(function(err, all_error){
        !err && all_error && (
          _.each(all_error, function(order_error, index){
            publisher.publisher('website_order_point', order_error, function(cb){
                cb && order_error.remove();
            })
          })
        );
      });
	});

  

}