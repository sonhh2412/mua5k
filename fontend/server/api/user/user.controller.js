'use strict';
var _ = require('lodash');

var passport = require('passport');
var config = require('../../config/environment');
var vnptepay = require('../../vnptepay');
var jwt = require('jsonwebtoken');

var product_product = require('../../../node_amqplib/node_mongodb/product_product/model.product.product');

var New_Notify = require('../../../node_amqplib/node_mongodb/notify_content/model.notify.content');

var User = require('../../../node_amqplib/node_mongodb/res_user/model.res.user');

var ControlUser = require('../../../node_amqplib/node_mongodb/res_user/controller.res.user');

var K_Even = require('../../../node_amqplib/node_mongodb/k_event/model.k.event');

var websiteTransactionK_error = require('../../../node_amqplib/node_mongodb/res_user/model.website.transactionk.error');

var Coutries_state = require('../../../node_amqplib/node_mongodb/res_countries_state/model.res.coutries.state');

var errUser = require("../../../node_amqplib/node_mongodb/res_user/model.res.user.error");

var errUserLogin = require("../../../node_amqplib/node_mongodb/res_user/model.res.user.error.login.history");

var publisher = require("../../../node_amqplib/lib_publisher");

var randomstring = require('randomstring');

var ip = require('ip');

var mailer = require('nodemailer');

var request = require('request');

var md5 = require('md5');

var parseMetaRefresh = require("http-equiv-refresh");

var http = require('http');

var url = require('url') ;

var urlencode = require('urlencode');
var strftime = require('strftime');
var mongoose = require('mongoose');

var paginate = require('node-paginate-anything');

var Notification5k = require("./notification");

var validationError = function(res, err) {
    return res.status(422).json(err);
};

/**
 * Get list of users
 * restriction: 'admin'
 */
exports.index = function(req, res) {

    User.find({}, '-salt -hashedPassword', function(err, users) {
        if (err) return res.status(500).send(err);
        res.status(200).json(users);
    });
};


var hashCode = function(str){
    var hash = 5381;
    for (var i = 0; i < str.length; i++) {
        var char = str.charCodeAt(i);
        hash = ((hash << 5) + hash) + char; 
    }
    return hash < 0 ? hash * -1 : hash ;
}

exports.getUserbyDir = function(req, res, next){


    _.size(req.body) > 0 && !_.isUndefined(req.body.id) ? (
        User.findById(req.body.id, function(err, user) {
            !err && user ? (
              
                user.fullname ? (
                    String.prototype.capitalize = function() {
                        return this.replace(/(?:^|\s)\S/g, function(a) { return a.toUpperCase(); });
                    },
                    res.send({name : user.fullname.capitalize().toString()})
                ) : (
                    res.send({name : md5(user._id)})
                )
            ) : (
                 res.status(403).send("Forbidden")
            )

            
        })
    ) : (
        res.status(403).send("Forbidden")
    )
}

exports.getUserbyEmail = function(req, res, next) {
    _.size(req.body) > 0 && !_.isUndefined(req.body.email) ? (
        User.findOne({email: req.body.email}, function(err, user) {
            !err && user ? (
              
                user.fullname ? (
                    String.prototype.capitalize = function() {
                        return this.replace(/(?:^|\s)\S/g, function(a) { return a.toUpperCase(); });
                    },
                    res.send({name : user.fullname.capitalize().toString()})
                ) : (
                    res.send({name : md5(user._id)})
                )
            ) : (
                 res.status(403).send("Forbidden")
            )

            
        })
    ) : (
        res.status(403).send("Forbidden")
    )
} 


exports.getEventK  = function(req, res, next){
    if(!_.isUndefined(req.user) && _.size(req.user) > 0 && req.user.role === 'admin'){
        K_Even.findOne({}, function(err, event){
            event = {
                active : event.active,
                startDate : event.startDate,
                endDate : event.endDate,
                k_number : event.k_number,
                history : event.history,
                date : event.date
            }
            err ? ( res.status(403).send("Forbidden") ) : (res.send(event));
        })
    }else{
        res.status(403).send("Forbidden");
    }
}

exports.updateEventK = function(req, res, next){
    var session = _.size(req.body) > 0 && !_.isUndefined(req.body.session) ? req.body.session : null;
    if(session && session.k_number % 1 === 0 && _.isDate(new Date(session.startDate) ) && _.isDate(new Date(session.endDate)) && !_.isUndefined(req.user) && _.size(req.user) > 0 && req.user.role === 'admin'){
        var history = {
            start : new Date(session.startDate),
            end : new Date(session.endDate),
            active : session.active,
            create : new Date(),
            k_number : parseInt(session.k_number)
        };

        
        K_Even.findOne({}, function(err, event){
            err ? (
                res.status(403).send("Forbidden")
            ) : (
                _.size(event) > 0 ? (
                    event.update({
                        $push : {
                            history: history
                        },
                        active : session.active,
                        startDate : new Date(session.startDate),
                        endDate : new Date(session.endDate),
                        k_number : session.k_number,
                        date : new Date()
                    }, function(err, result){
                        err ? (
                            res.status(403).send("Forbidden")
                        ) : (
                            K_Even.findOne({
                                _id : event._id
                            }, function(err, event){
                                event = {
                                    active : event.active,
                                    startDate : new Date(session.startDate),
                                    endDate : new Date(session.endDate),
                                    k_number : event.k_number,
                                    history : event.history,
                                    date : event.date
                                }
                                err ? ( res.status(403).send("Forbidden") ) : (res.send(event));
                            })
                        )
                    })
                ) : (
                    new K_Even(session).save(function(err, event){
                        event.update({
                            $push : {
                                history: history
                            }
                        }, function(err, result){
                            err ? (
                                res.status(403).send("Forbidden")
                            ) : (
                                K_Even.findOne({
                                    _id : event._id
                                }, function(err, event){
                                    event = {
                                        active : event.active,
                                        startDate : new Date(session.startDate),
                        endDate : new Date(session.endDate),
                                        k_number : event.k_number,
                                        history : event.history,
                                        date : event.date
                                    }
                                    err ? ( res.status(403).send("Forbidden") ) : (res.send(event));
                                })
                            )
                        })
                    })
                )
            )
        });
        

    }else{
        res.status(403).send("Forbidden");
    }
};

exports.getInfoActive = function(req, res, next){
    // return res.status(403).send('error');
    if(req.method == 'GET' && !_.isUndefined(req.params.id)){
        var json = {};
        var array_tmp = req.params.id.split("_");
        _.size(array_tmp) === 2 ? (
            User.findOne({
                _id : array_tmp[0],
                code : array_tmp[1],
                actived : false
            }, function(err, user){
                if(err === null && _.size(user) > 0){
                    json = {
                        email : user.email,
                        passwd : user.password_input,
                        telephone : user.telephone,
                        created : strftime('%F %T', user.created)
                    }

                    user.update({
                        actived : true
                    }, function(err, result){
                        err === null && (

                            publisher.publisher('website_customer', user, function(cb){

                                !cb && new errUser(user).save(function(err, result){});
                          
                                
                                cb && (

                                    user.ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.socket.remoteAddress || req.connection.socket.remoteAddress,
        
                                    request('http://ipinfo.io/'+user.ip+'/region', function(error_ipinfo, res_ipinfo, body) {
                                    
                                        user.region = body.trim()
                                        user.region == 'undefined' && (user.region = '')
                                        new errUserLogin(user)
                                        .save(function(errSaveLogin, userLogin) {
                                            // console.log(userLogin);
                                        })
                                    })
                                );
                                
                            }),
                            res.json({ json : json, token: jwt.sign({ _id: user._id }, config.secrets.session, { expiresIn: 60 * 60 * 5 }) })
                        )
                    })
                }else{
                    res.status(403).send()
                }
                
            })
        ) : (
            res.status(403).send()
        )
    }else{
        res.status(403).send()
    }
    
}

/**
 * Creates a new user
 */

var validateEmail = function (email) {
    var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
};

var isInt = function (value) {
    return value % 1 === 0 && value > 0;
};

var validatePhone = function (txtPhone) {
    var phoneno = /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/im;
    return txtPhone.match(phoneno);
};

var randomIntFromInterval = function(min,max) {
    return Math.floor(Math.random()*(max-min+1)+min);
};

var replacePhone = function(textPhone){
    return textPhone.replace("+","").replace("-","").replace("(","").replace(")","").replace(" ","");
};

exports.create = function(req, res, next) {
    if (req.method == 'POST') {
        var err_token = [],
            timeout = null,
            isPhone = false,
            isEmail = false,
            addtimeout = 3;

            //console.log(req.body);

        _.size(req.body) > 4 ? (
            // request.post('https://www.google.com/recaptcha/api/siteverify', 
            //     {form:{ secret: "6LceSBwUAAAAAFedcS6iJ415Xs6LQj2ewl_icrA0", response : req.body.response }}, 
            // function(error, response, body){
                // body = JSON.parse(body.toString()),
                // error === null && body.success === true ? (

                    isInt(req.body.email) ? (

                        _.size(validatePhone(req.body.email)) > 0 ? (

                            isPhone = true,
                            isEmail = false
                        ) : (
                            res.status(304).send()
                        )
                    ) : (
                        validateEmail(req.body.email) ? ( 
                            isPhone = false,
                            isEmail = true
                        ) : (
                            res.status(304).send()
                        )
                    ),
      
                    (isPhone === true || isEmail === true) && (

                        isPhone === true && (req.body.telephone = replacePhone(req.body.email), addtimeout = 15),
                        timeout = new Date(),
                        timeout.setMinutes(timeout.getMinutes() + addtimeout),
                    
                        req.body.password === req.body.rePassword &&  (
                            
                            delete req.body.rePassword,  delete req.body.capcha,
                            req.body.code = randomIntFromInterval(10000, 100000),
                            req.body.timeout = timeout,
                            req.body.last_day_of_month = new Date(new Date().getFullYear(), new Date().getMonth(), 0).getDate(),
                            req.body.password_input = req.body.password,
                            req.body.created = new Date(),

                            new User(req.body)
                                .save(function(err, user) {
                                    err && (
                                        ('telephone' in err.errors) && err_token.push(2),
                                        ('email' in err.errors) && err_token.push(3),
                                        validationError(res, err_token)                        
                                    );
                                    !err && (
                                        res.status(200).json(user)
                                    );
                                })
                        )
                    )
                    
                // ) : (
                //     res.status(304).send()
                // )

            // })
        ) : (
            res.status(304).send()
        )
    }
}


exports.setActive = function(req, res, next) {
    User.findOneAndUpdate(
        {_id : req.params.id , code : req.body.code },
        {$set : {actived : true}}, 
        function(err, results){

            err || !results && res.status(403).send('Forbidden');
            !err && results && User.findById(req.params.id , function(err, user){

                !err ? (
                    publisher.publisher('website_customer', user, function(cb){

                        !cb && new errUser(user).save(function(err, result){});
                  
                        
                        cb && (
                            user.ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.socket.remoteAddress || req.connection.socket.remoteAddress,
                            request('http://ipinfo.io/'+user.ip+'/region', function(error_ipinfo, res_ipinfo, body) {
                            
                                user.region = body.trim()
                                user.region == 'undefined' && (user.region = '')
                                new errUserLogin(user)
                                .save(function(errSaveLogin, userLogin) {
                                    
                                    errSaveLogin ? validationError(res, errSaveLogin) : res.json({ token: jwt.sign({ _id: user._id }, config.secrets.session, { expiresIn: 60 * 60 * 5 }) })
                                })
                            })
                        );
                        
                    })
                    
                ) : (
                    res.status(403).send('Forbidden')
                )
            })
        }
    );
}

exports.getActive = function(req, res, next) {
    User.findById(req.params.id, function(err, user) {
        return (!user || err) ? res.status(401).send('Unauthorized') : res.json(user.getActive);
    });
}

exports.BuyK = function(req, res, next){   
    var datenow = new Date();
    var hostname = 'http://' + req.headers.host;
    var userId = req.user._id;
    var merchant_id = config.nganluong_card.merchant_id;
    var merchant_password = config.nganluong_card.merchant_password;
    var receiver_email = 'mua5k.com@gmail.com';
    var return_url = urlencode(hostname + '/ket-qua-tra-ve.html');
    var bank_code = ('bankcode' in req.body.user) ? req.body.user.bankcode : '';
    var total_amount = req.body.user.price;
    if(total_amount % 1 === 0 && total_amount > 0){
        // var total_amount = 2000;
        var params = {
            'cur_code'              : 'vnd',
            'function'              : 'SetExpressCheckout',
            'version'               : '3.1',
            'merchant_id'           : merchant_id, //Mã merchant khai báo tại NganLuong.vn
            'receiver_email'        : receiver_email,
            'merchant_password'     : md5(merchant_password), //MD5(Mật khẩu kết nối giữa merchant và NganLuong.vn)                     
            'order_code'            : req.body.user.product, //Mã hóa đơn do website bán hàng sinh ra
            'total_amount'          : total_amount, //Tổng số tiền của hóa đơn                        
            'payment_method'        : req.body.user.option_payment, //Phương thức thanh toán, nhận một trong các giá trị 'ATM_ONLINE', 'ATM_OFFLINE' hoặc 'NH_OFFLINE'
            'bank_code'             : bank_code, //Mã Ngân hàng
            'payment_type'          : '', //Kiểu giao dịch: 1 - Ngay; 2 - Tạm giữ; Nếu không truyền hoặc bằng rỗng thì lấy theo chính sách của NganLuong.vn
            'order_description'     : urlencode(req.body.user.comments), //Mô tả đơn hàng
            'tax_amount'            : 0, //Tổng số tiền thuế
            'fee_shipping'          : 0, //Phí vận chuyển
            'discount_amount'       : 0, //Số tiền giảm giá
            'return_url'            : return_url,
            'cancel_url'            : urlencode(req.body.user.cancel_url),
            'buyer_fullname'        : req.user.fullname,
            'buyer_email'           : req.user.email,
            'buyer_mobile'          : req.user.telephone, //Điện thoại người mua
            'buyer_address'         : req.user.street,
            'total_item'            : '0'
        };

        var post_field = '';
        params.bank_code === '' && delete params['bank_code'];

        _.each(params, function(value, key){
            post_field === '' ? (
                post_field += '?' + key + '=' + value + '&'   
            ) : (
                key !== 'total_item' ? post_field += key + '=' + value + '&' : post_field += key + '=' + value 
                
            )
       
        });
        //console.log(post_field);
        var url_redirect = 'https://www.nganluong.vn/checkout.api.nganluong.post.php'+post_field;

        User.findById(userId, function(err, user) {
            request({
                headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
                },
                uri: url_redirect,
                // uri: 'https://www.nganluong.vn/checkout.api.nganluong.post.php?cur_code=vnd&function=SetExpressCheckout&version=3.1&merchant_id=48792&receiver_email=tungnguyen@icsc.vn&merchant_password=491abab6fe2501e198f4758e8b7dc474&order_code=macode_1484733244&total_amount=500000&payment_method=NL&payment_type=&order_description=&tax_amount=0&fee_shipping=0&discount_amount=0&return_url=http://localhost/nganluong.vn/checkoutv3/payment_success.php&cancel_url=http%3A%2F%2Flocalhost%2Fnganluong.vn%2Fcheckoutv3%3Forderid%3Dmacode_1484733244&buyer_fullname=Nguyen Thanh Tung&buyer_email=phucnguyen@icsc.vn&buyer_mobile=0988960202&buyer_address=&total_item=0',
            }, function (err, response, body) {
                //console.log(body);
                var parseString = require('xml2js').parseString;
                var xml = body
                parseString(xml, function (err, result) {
                    if(err){
                        res.status(401).send('Unauthorized');   
                    }else{
                        var current_oder = user.history_oder ? user.history_oder : [];
                        var oder_item = [{
                            "token"                 : result.result.token[0],
                            "order_code"            : req.body.user.product,
                            "total_amount"          : req.body.user.price,                             
                            "url_post"              : url_redirect,                             
                            "url_checkout"          : result.result.checkout_url[0],                               
                            "payment_method"        : req.body.user.option_payment,                                
                            "order_description"     : req.body.user.comments,
                            "state"                 : false,                                
                            "date_create"           : datenow,
                            "bank_code"             : bank_code,
                            "date_update"           : '',
                            "payment_type"          : '',
                            "receiver_email"        : receiver_email,
                            'buyer_fullname'        : req.user.fullname,
                            'buyer_email'           : req.user.email,
                            'buyer_mobile'          : req.user.telephone, //Điện thoại người mua
                            "transaction_id"        : '',
                            "transaction_status"    : '02' //00 - Đã thanh toán; 01 - Đã thanh toán, chờ xử lý;  02 - Chưa thanh toán
                        }];
                        oder_item = current_oder.concat(oder_item);

                        User.findOneAndUpdate(
                            {_id : userId},
                            {$set : {history_oder : oder_item}}, 
                            function(err, results){
                                !err ? (
                                    ControlUser.updateNotifyMess([{ _id: userId }], 'my_wallet', function(result){
                                        !_.isUndefined(process.socket) && (
                                            process.socket.emit('customer:my_wallet', {
                                                'partner_id': userId
                                            }),
                                            process.socket.broadcast.emit('customer:my_wallet', {
                                                'partner_id': userId
                                            })
                                        )
                                    }),
                                    res.json({url: result.result.checkout_url[0]})
                                ) : res.status(401).send('Unauthorized');
                            }
                        );
                    }                
                });
            }); 
        });
    }else{
         res.status(401).send('Unauthorized');
    }
}

exports.ReturnBuyK = function(req, res, next){
    var datenow = new Date();
    var token = req.params.token;
    // var userId = req.user._id;
    var userId = null;
    var data_push = null;
    var hrTime = process.hrtime();
    var mcTime = hrTime[0] * 1000000 + hrTime[1] / 100;
    var tmpKNumber = false;
    mcTime = mcTime.toString().split('.'), mcTime = mcTime[1];

    User.findOne({'history_oder.token':token}, function(err, user) {
       
        if(err || !user){
            res.status(401).send('Unauthorized');
            return;            
        }else{
           userId = user._id;
        }
        
        var merchant_id = config.nganluong_card.merchant_id;
        var merchant_password = config.nganluong_card.merchant_password;

        var params = {           
            'merchant_id'           : merchant_id,
            'merchant_password'     : md5(merchant_password),               
            'version'               : '3.1',
            'function'              : 'GetTransactionDetail',
            'token'                 : token
        };
        var post_field = '';

        _.each(params, function(value, key){
            post_field === '' ? (
                post_field += '?' + key + '=' + value + '&'   
            ) : (
                key !== 'total_item' ? post_field += key + '=' + value + '&' : post_field += key + '=' + value 
                
            )       
        });
        var url_redirect = 'https://www.nganluong.vn/checkout.api.nganluong.post.php'+post_field;
        request({
            headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
            },
            uri: url_redirect,
        }, function (err, response, body) {
           
            var parseString = require('xml2js').parseString;
            var msg_status = false;
            var xml = body
            parseString(xml, function (err, result) {
                
                if(err){
                    res.status(401).send('Unauthorized')
                }else{                 
                    if(result.result.token[0] === token && result.result.transaction_status[0] === "00"){
                        var current_oder = user.history_oder ? user.history_oder : [];
                        var k_number =  user.k_number ? user.k_number : 0;
                        
                        for(var i=0 ; i < current_oder.length; i++)
                        {
                            if(current_oder[i].token === token && current_oder[i].state === false){
                                k_number = k_number + parseInt(result.result.total_amount[0] / 1000);
                                tmpKNumber = true;
                                current_oder[i].state = true;
                                current_oder[i].total_amount = result.result.total_amount[0];
                                current_oder[i].bank_code = result.result.bank_code[0];                                
                                current_oder[i].date_update = datenow;
                                current_oder[i].transaction_status = result.result.transaction_status[0];
                                current_oder[i].transaction_id = result.result.transaction_id[0];
                                current_oder[i].receiver_email = result.result.receiver_email[0];
                                current_oder[i].payment_type = result.result.payment_type[0];
                                // current_oder[i].buyer_fullname = result.result.buyer_fullname[0];
                                // current_oder[i].buyer_email = result.result.buyer_email[0];
                                // current_oder[i].buyer_mobile = result.result.buyer_mobile[0];
                                msg_status = true;
                                break;                                
                            }
                            
                        }
                        User.findOneAndUpdate(
                            {_id : userId},
                            {$set : {
                                    history_oder : current_oder,
                                    k_number : k_number
                                }
                            },function(err, results){
                                !err ? (
                                    res.status(200).json({msg_status : msg_status}),
                                    ControlUser.updateNotifyMess([{ _id: userId }], 'my_wallet', function(result){
                                        !_.isUndefined(process.socket) && (
                                            process.socket.emit('customer:my_wallet', {
                                                'partner_id': userId
                                            }),
                                            process.socket.broadcast.emit('customer:my_wallet', {
                                                'partner_id': userId
                                            })
                                        ),
                                        Notification5k.sendNotificationforOneUser("Bạn vừa nhận "+result.result.total_amount[0]+" K từ ngân lượng !", user._id)
                                    }),
                                    //dong bo odoo
                                    tmpKNumber === true && (
                                        data_push = {
                                            partner_id : [userId, user.email],
                                            amount : parseInt(result.result.total_amount[0] / 1000),
                                            date_exchange : datenow,
                                            type_exchange : 'addition',
                                            millisecond : parseInt(mcTime)
                                        },

                                        publisher.publisher('website_transactionK', data_push, function(cb){
                                            //neu err save err to website_transactionK
                                            !cb && (
                                                new websiteTransactionK_error(data_push).save(function(err, result){})
                                            )

                                        })
                                    )

                                ) : res.status(401).send('Unauthorized');
                            }
                        );                        
                    }
                }
            });
        }); 
        
    })
}

exports.ChuyenK = function(req, res, next){

    if(parseInt(req.body.user.numberk) % 1 === 0){
        var userId = req.params.id;
        var email = req.body.user.email.trim();
        var datenow = new Date();
        var id_transfer = 'TF' + Date.now();
        var hrTime = process.hrtime();
        var mcTime = hrTime[0] * 1000000 + hrTime[1] / 100;
        mcTime = mcTime.toString().split('.'), mcTime = mcTime[1];

        // console.log(id_transfer);
        User.findOne({
            $or : [
                { email: email.toLowerCase()},
                { telephone : email.toLowerCase()}
            ]                      
        }, function(err2, user2) {
            // console.log(user2);
            if (err2 || _.size(user2) === 0) {
                res.status(403).json({messerr : 1, alertmsg : 'Tài khoản nhận không tồn tại trong hệ thống'});
            }else{            
                if( req.user._id.toString() === user2._id.toString()){
                    res.status(403).json({messerr : 1, alertmsg : 'Tài khoản nhận không tồn tại trong hệ thống'});
                }else{
                    if(_.size(user2) === 0){
                    res.status(403).json({messerr : 1, alertmsg : 'Bạn không thể chuyển K cho chính mình'});
                }else{                
                        User.findById(userId, function(err, user) {
                            var history_transfer = user.history_transfer ? user.history_transfer : [];
                            var k_number = user.k_number ? user.k_number : 0;
                            if(req.body.user.numberk > 0){
                                var numberk_for = k_number - (req.body.user.numberk);
                                if(numberk_for >= 0){
                                    var transfer_item = [{
                                        "id_transfer"           : id_transfer,
                                        "date_create"           : datenow,
                                        "email"                 : req.body.user.email,
                                        "total_k"               : req.body.user.numberk,                             
                                        "transfer_description"  : req.body.user.contenttransferk,
                                        "transfer_type"         : 'for'                            
                                    }];

                                    history_transfer = history_transfer.concat(transfer_item);
                                    //console.log(history_transfer);
                                    User.findOneAndUpdate(
                                        {_id : userId},
                                        {$set : {
                                            history_transfer : history_transfer,
                                            k_number : numberk_for
                                        }}, 
                                        function(err, results){
                                            if (err) {
                                                res.status(401).send('Unauthorized');
                                            }else{
                                                ControlUser.updateNotifyMess([{ _id: userId }], 'my_wallet', function(result){
                                                    !_.isUndefined(process.socket) && (
                                                        process.socket.emit('customer:my_wallet', {
                                                            'partner_id': userId
                                                        }),
                                                        process.socket.broadcast.emit('customer:my_wallet', {
                                                            'partner_id': userId
                                                        })
                                                    ),
                                                    Notification5k.sendNotificationforOneUser('Quý khách nhận được <'+req.body.user.numberk+' K> từ bạn bè. Xem ngay !', user2._id)
                                                });
                                                var data_push = {
                                                    partner_id : [userId, results.email],
                                                    amount : parseInt(req.body.user.numberk),
                                                    date_exchange : datenow,
                                                    type_exchange : 'subtraction',
                                                    millisecond : parseInt(mcTime)
                                                };

                                                publisher.publisher('website_transactionK', data_push, function(cb){
                                                    //neu err save err to website_transactionK
                                                    !cb && (
                                                        new websiteTransactionK_error(data_push).save(function(err, result){})
                                                    )

                                                });

                                                var history_transfer2 = user2.history_transfer ? user2.history_transfer : [];
                                                var k_number2 = user2.k_number ? user2.k_number : 0;
                                                var numberk_receive = k_number2 + (req.body.user.numberk);
                                                var transfer2_item = [{
                                                    "id_transfer"           : id_transfer,
                                                    "date_create"           : datenow,
                                                    "email"                 : user.email,
                                                    "total_k"               : req.body.user.numberk,                             
                                                    "transfer_description"  : req.body.user.contenttransferk,
                                                    "transfer_type"         : 'receive'                           
                                                }];
                                                history_transfer2 = history_transfer2.concat(transfer2_item);
                                                User.findOneAndUpdate(
                                                    {_id : user2._id},
                                                    {$set : {
                                                        history_transfer : history_transfer2,
                                                        k_number : numberk_receive
                                                    }}, 
                                                    function(err, results){
                                                        if (err) {
                                                            res.status(401).send('Unauthorized')
                                                        }else{
                                                            ControlUser.updateNotifyMess([{ _id: user2._id }], 'my_wallet', function(result){
                                                                !_.isUndefined(process.socket) && (
                                                                    process.socket.emit('customer:my_wallet', {
                                                                        'partner_id': user2._id
                                                                    }),
                                                                    process.socket.broadcast.emit('customer:my_wallet', {
                                                                        'partner_id': user2._id
                                                                    })
                                                                )
                                                            });
                                                            var data_push = {
                                                                partner_id : [user2._id, results.email],
                                                                amount : parseInt(req.body.user.numberk),
                                                                date_exchange : datenow,
                                                                type_exchange : 'addition',
                                                                millisecond : parseInt(mcTime)
                                                            };

                                                            publisher.publisher('website_transactionK', data_push, function(cb){
                                                                //neu err save err to website_transactionK
                                                                !cb && (
                                                                    new websiteTransactionK_error(data_push).save(function(err, result){})
                                                                )

                                                            });

                                                            res.status(200).send()
                                                        }
                                                    }
                                                );
                                            }
                                        }
                                    );
                                }else{
                                    res.status(403).json({messerr : 2, alertmsg : 'Số dư K không đủ để chuyển'})
                                }
                            }
                        });
                    }
                }
                
            }
            
        });
    }else{
        res.status(403).json({messerr : 2, alertmsg : 'Số dư K không đủ để chuyển'})
    }
    
}
/**
 * Get a single user
 */
exports.show = function(req, res, next) {

    var userId = req.params.id;

    User.findById(userId, function(err, user) {
        if (err) return next(err);
        if (!user) return res.status(401).send('Unauthorized');
        res.json(user.profile);
    });
};

/**
 * Deletes a user
 * restriction: 'admin'
 */
exports.destroy = function(req, res) {
    User.findByIdAndRemove(req.params.id, function(err, user) {
        if (err) return res.status(500).send(err);
        return res.status(204).send('No Content');
    });
};

/**
 * Change a users password
 */
 
// Update profile
exports.updateUser = function(req, res, next) {
    var userId = req.user._id;
    req.body = req.body.user;
    
    // req.body ///get server
    // res.params //post
    

    User.findById(userId, function(err, user) {
        var birthday = new Date(req.body.curdate);
        var month_of_birth = birthday.getMonth() + 1;
        var day_of_birth = birthday.getDate();
        var year_of_birth = birthday.getFullYear();
        if(!err && user){
            if(user.getAddres.length == 0){
                var address = [{
                    "website_id": md5(new Date()),

                    "name" : req.body.fullname,
     
                    "street": req.body.street,

                    "email" : req.user.email,

                    "state_id": parseInt(req.body.state_id),
                  
                    "country_id": 243,
                    
                    "phone": req.body.email,
                    
                    "default":true
                }];
            }else{
                var address = user.getAddres;
            }    
            
            if(req.params.id == userId){

                User.findOneAndUpdate(
                    {_id : userId},
                    {$set : {
                        fullname : req.body.fullname,
                        gender : req.body.gender,
                        // telephone : req.body.telephone,
                        street : req.body.street,
                        income_monthly : req.body.income_monthly,
                        signature : req.body.signature,
                        year_of_birth : year_of_birth,
                        month_of_birth : parseInt(month_of_birth) < 10 ? '0' + month_of_birth : month_of_birth,
                        day_of_birth : parseInt(day_of_birth) < 10 ? '0' + day_of_birth : day_of_birth,
                        state_id : parseInt(req.body.state_id),
                        address : address
                    }}, function(err, results){
                        !err ? (
                            User.findById(results._id , function(err, user){
                                !err ? (
                                    publisher.publisher('website_customer', user, function(cb){
                                        !cb && new errUser(user).save(function(err, result){})
                                    }),
                                    res.json({ token: jwt.sign({ _id: results._id }, config.secrets.session, { expiresIn: 60 * 60 * 5 }) })
                                ) : (
                                    res.status(403).send()
                                )
                            })
                        ) : (
                            res.status(403).send()
                        )
                    }
                );
            }
        }        
    });  
};

// Update profile
exports.updateShowGuide = function(req, res, next) {
    var userId = req.user._id;
    req.body = req.body.user;
    // req.body ///get server
    // res.params //post   

    User.findById(userId, function(err, user) {        
        if(!err && user){  
            if(req.params.id == userId){
                User.findOneAndUpdate(
                    {_id : userId},
                    {$set : {                       
                        show_guide : 1
                    }}, function(err, results){
                        !err ? (
                            res.status(200).send()
                        ) : (
                            res.status(403).send()
                        )
                    }
                );
            }
        }        
    });  
};

exports.updateShippingAddress = function(req, res, next) {
    var userId = req.user._id;
    req.body = req.body.user;
    
    // req.body ///get server
    // res.params //post
   

    User.findById(userId, function(err, user) {
        if(!err && user){
            var id_arr = req.body.id;
            var alertmsg = "";
            if(id_arr != null){
                var address = user.getAddres;
                
                for(var i=0 ; i < address.length; i++)
                {
                    if(req.body.default == true){
                        if(i == id_arr){
                            address[i].name = req.body.name;
                            address[i].street = req.body.street;
                            address[i].state_id = parseInt(req.body.state_id);
                            address[i].phone = req.body.phone;
                            address[i].default = req.body.default;
                        }else{
                            address[i].default = false;
                        }
                    }else{
                        if(i == id_arr){
                            address[i].name = req.body.name;
                            address[i].street = req.body.street;
                            address[i].state_id = parseInt(req.body.state_id);
                            address[i].phone = req.body.phone;
                            address[i].default = req.body.default;
                        }
                    }
                    
                }
                alertmsg = "Cập nhật địa chỉ thành công";

            }else{
                var address_item = [{
                    "website_id" : md5(new Date()),
                    "name" : req.body.name,
                  
                    "street": req.body.street,
                 
                    "state_id": parseInt(req.body.state_id),
                   
                    "country_id": 243,
                    
                    "phone": req.body.phone,
                    
                    "default":req.body.default,

                    "email" : req.user.email
                }];

                if(req.body.default == true){                    
                    var address = user.getAddres;
                    for(var i=0 ; i < address.length; i++)
                    {
                        address[i].default = false;                        
                    }
                    address = address.concat(address_item);
                }else{
                    var address = user.getAddres.concat(address_item);
                }
                alertmsg = "Thêm mới một địa chỉ thành công";                
            }            
            
            if(req.params.id == userId){
                User.findOneAndUpdate(
                    {_id : userId},
                    {$set : {
                        address : address
                    }}, function(err, results){
                        !err ? (
                            User.findById(results._id , function(err, user){

                                !err ? (
                                    publisher.publisher('website_customer', user, function(cb){

                                        !cb && new errUser(user).save(function(err, result){})
                                    }),
                                   res.status(200).json({ token: jwt.sign({ _id: results._id }, config.secrets.session, { expiresIn: 60 * 60 * 5 }) , results : address, alertmsg : alertmsg})
                                ) : (
                                    res.status(403).send()
                                )
                            })
                        ) : (
                            res.status(403).send()
                        )
                    }
                );
            }
        }        
    });  
};

exports.removeShippingAddress = function(req, res, next){
    var userId = req.user._id;
    req.body = req.body.user;

    User.findById(userId, function(err, user) {
        if(!err && user){           
            var id_arr = req.body.id;
            if(id_arr != null){
                var address = user.getAddres;
                var alert = '';
                for(var i=0 ; i < address.length; i++)
                {
                    if(i == id_arr && address[i].default != true){
                        address.splice(i,1);
                        alert = 'Xóa địa chỉ thành công';
                        break;
                    }else{
                        alert = 'Bạn không thể xóa địa chỉ mặc định';
                    }
                }
                
                User.findOneAndUpdate(
                    {_id : userId},
                    {$set : {
                        address : address
                    }}, function(err, results){
                        if(!err){
                            res.status(200).json({ token: jwt.sign({ _id: results._id }, config.secrets.session, { expiresIn: 60 * 60 * 5 }) , results : address, alert : alert});
                        }else{
                            res.status(403).send();
                        }
                    }
                );
            }        
        }        
    });  
}

exports.defaultShippingAddress = function(req, res, next){
    var userId = req.user._id;
    req.body = req.body.user;

    User.findById(userId, function(err, user) {
        if(!err && user){           
            var id_arr = req.body.id;
            if(id_arr != null){
                var address = user.getAddres;
                
                for(var i=0 ; i < address.length; i++)
                {
                    if(i == id_arr){
                        address[i].default = true;
                    }else{
                        address[i].default = false;
                    }
                }
                // console.log(address);                
                User.findOneAndUpdate(
                    {_id : userId},
                    {$set : {
                        address : address
                    }}, function(err, results){
                        if(!err){
                            res.status(200).json({ token: jwt.sign({ _id: results._id }, config.secrets.session, { expiresIn: 60 * 60 * 5 }) , results : address});
                        }else{
                            res.status(403).send();
                        }
                    }
                );
            }        
        }        
    }); 
}


exports.updatePassword = function(req, res, next){
    var userId = req.user._id;
    req.body = req.body.user;
    User.findById(userId, function(err, user) {
        if (user && user.password_input === req.body.passwordold) { 
            user.password = req.body.password; 
            user.password_input = req.body.password;       
            user.update(user, function(err, result) {                
                if (err) res.status(403).send();                
                else {     
                    publisher.publisher('website_customer', user, function(cb){
                        !cb && new errUser(user).save(function(err, result){})
                    }),
                    res.json({ token: jwt.sign({ _id: user._id }, config.secrets.session, { expiresIn: 60 * 60 * 5 }) })                
                }            
            });        
        } else {            
            res.status(403).send('Forbidden');        
        }    
    });
};

// Update avatar
exports.uploadFile = function(req, res, next){

    if (!req.files) {
        res.status(500).send('No files were uploaded.');
        return;
    }

    req.files.file.mv(config.root+'/public/assets/upload/' + req.user._id , function(err) {
        if (err) {
            return res.status(500).send('Update Fail');
        }
        else {
            User.findOneAndUpdate(
                {_id : req.user._id},
                {$set : {
                    avatar : '/assets/upload/' + req.user._id,
                }}, function(err, results){

                    !err ? (
                        User.findById(results._id , function(err, user){
                            !err ? (
                                publisher.publisher('website_customer', user, function(cb){
                                    !cb && new errUser(user).save(function(err, result){})
                                }),
                               res.status(200).send('File uploaded!')
                            ) : (
                                res.status(403).send()
                            )
                        })
                    ) : (
                        res.status(403).send()
                    )

                    
                }
            );
            
        }
    });
};

exports.getUserbyId = function(req, res, next) {
    User.findById(req.params.id, function(err, user) {
        if(!err && user){
            user.password_input = (!err && _.size(user) > 0) ? md5(new Date()) : '';
            user.hashedPassword = (!err && _.size(user) > 0) ? md5(new Date()) : '';
            user.salt = (!err && _.size(user) > 0) ? md5(new Date()) : '';
            user.string_fogot_passwd = (!err && _.size(user) > 0) ? md5(new Date()) : '';
            return (!user || err) ? res.status(403).send('Forbidden') : res.json(user);
        }else{
            res.status(403).send('Forbidden')
        }
        
    });   
};

exports.getTotalKById = function(req, res, next) {

    // User.findById(req.params.id, 'k_number', function(err, user) {
    //     console.log(user);
    //     return (!user || err) ? res.status(403).send('Forbidden') : res.json(user);
    // });
     User.findById(
        req.params.id
    )
    .select({
        k_number : !0,
    })
    .exec(function(err, results) {
        !err ? res.status(200).send(results) :  res.status(403).send('Forbidden');     
    })
};

exports.GetCustomById = function(req, res, next) {
    //console.log(req.body.data.id_user);
    var id_user = req.body.data.id_user;
    var id_user_login = "";
    if(req.body.data.id_login){
        id_user_login = req.body.data.id_login;
    }

    var datenow = new Date();
    User.findById(id_user, function(err, user) {
        if (!user || err){
            res.status(403).send('Forbidden')
        }else{
            if(id_user === id_user_login || id_user_login == ""){
                res.json(user)
            }else{
                var visitor = user.visitor ? user.visitor : [];
                var visitor_item = [{
                    "id_user"                 : id_user_login,
                    "date_visitor"            : datenow,
                    "total_visitor"          : 1,                             
                }];
                visitor_item = visitor.concat(visitor_item);

                User.findOneAndUpdate(
                    {_id : id_user},
                    {$set : {visitor : visitor_item}}, 
                    function(err, results){
                        !err ? res.json(user) : res.status(401).send('Unauthorized');
                    }
                );
            }
                        
        }
    });
};

/**
 * Get my info
 * Controller me
 */
exports.me = function(req, res, next) {

    User.findById( req.user._id, '-salt -hashedPassword', function(err, user) { // don't ever give out the password or salt
        if (err) return next(err);
        if (!user) return res.status(401).send('Unauthorized');
        user.email = typeof user.email === 'undefined' ? user.telephone : user.email;
        user.password_input = md5(new Date());
        user.hashedPassword = md5(new Date());
        user.salt = md5(new Date());
        user.string_fogot_passwd = (!err && _.size(user) > 0) ? md5(new Date()) : '';
        return res.json(user);
    });


};

/**
 * Authentication callback
 */
exports.authCallback = function(req, res, next) {
    res.redirect('/');
};

/**
 * Check email of User is Exits
 */
exports.checkEmailExits = function(req, res) {
    User.findOne({email:req.body.email}, function(err, user){
        return (!user || err) ? res.status(403).send('Forbidden') : res.json(user);
    });
};

exports.checkForgotPasswd = function(req, res) {
    User.findOne({email:req.body.email}, function(err, user){
        return (!user || err) ? res.status(403).send('Forbidden') : res.json({_id:user._id, isPhone: user.isPhone, provider : user.provider});
    });
};


exports.SendSmsCodeForGotPasswd = function(req, res, next){
    if(req.method === 'PUT'){
        var timeout = null;
        if(!_.isUndefined(req.body) && _.size(req.body) > 0 && !_.isUndefined(req.body.id) && !_.isUndefined(req.body.code)){
            User.findOne({
                _id : req.body.id,
                string_fogot_passwd : req.body.code
            }, function(err, user){
                err === null && _.size(user) > 0 ? (
                    timeout = new Date(user.timeout_fogot_passwd),
                    timeout >= new Date() ? (
                        user.string_fogot_passwd = randomstring.generate(100),
                        
                        user.update(user, function(err, result){
                            err ? (
                                res.status(403).send('Forbidden')
                            ) : (
                                res.status(200).send({hash: user.string_fogot_passwd})
                            )
                        })
                    ) : (
                        res.status(403).send('err_timeout')
                    )
                ) : (
                    res.status(403).send('err_code')
                )
            })
        }else{
            res.status(403).send('Forbidden')
        }
    }
};

exports.SendSmsForGotPasswd = function(req, res, next){
    if(req.method === 'PUT'){
        // request.post('https://www.google.com/recaptcha/api/siteverify', {form:{ secret: "6LceSBwUAAAAAFedcS6iJ415Xs6LQj2ewl_icrA0", response : req.body.response }}, 
        //     function(error, response, body){
                // body = JSON.parse(body.toString())
                // if( error === null && body.success === true ){
                    var phone = null;
                    var data = null;
                    var tmpPhone = null;
                    var code = randomIntFromInterval(10000, 100000);
                    if(!_.isUndefined(req.body) && _.size(req.body) > 0 && !_.isUndefined(req.body.id) &&  !_.isUndefined(req.body.telephone) && req.body.telephone % 1 ===0){
                 
                        User.findOne({
                            telephone : req.body.telephone,
                            email : req.body.telephone,
                            _id : req.body.id
                        }, function(err, user){

                            if(user.count_sms_day > 2){
                                res.status(422).send('error_sms_count');
                            }else{
                                (err === null && _.size(user) > 0) ? (
                                    user.count_sms_day = _.isUndefined(user.count_sms_day) === true ? 1 : user.count_sms_day + 1,
                                    tmpPhone = user.telephone,
                                    phone = user.telephone.indexOf( '0' ) === 0 ? user.telephone = user.telephone.replace( '0', '' ) : user.telephone,
                                    user.telephone = tmpPhone,

                                    data = {
                                        cmdCode: config.sms.cmdCode,
                                        alias :  config.sms.alias,
                                        message : config.sms.forgotPassword + code + config.sms.descriptionPassword,
                                        sendTime : config.sms.sendTime,
                                        authenticateUser : config.sms.authenticateUser,
                                        authenticatePass :  config.sms.authenticatePass,
                                        msisdn : config.sms.msisdn + phone
                                    },


                                    request({
                                        url: config.sms.url,
                                        method: "POST",
                                        json: true,   
                                        headers: {
                                            "accept": "application/json",
                                            "content-type": "application/json; charset=utf-8"
                                        },
                                        body:  data
                                    }, function (error, response, body){
                                        console.log('send sms forgot password',error, body);
                                        if(body.error_code === 0){

                                            var timeout_fogot_passwd = new Date();
                                            timeout_fogot_passwd.setMinutes(timeout_fogot_passwd.getMinutes() + 3);

                                            user.string_fogot_passwd = code;
                                            user.timeout_fogot_passwd = timeout_fogot_passwd;
                                            user.update(user, function(err, result){
                                                err ? (res.status(422).send('err_update')) : (
                                                    res.send({id: user._id})
                                                );
                                            })
                                        }else{
                                            res.status(422).send('err_sms');
                                        }
                                    })
                                ) : (
                                    res.status(403).send("err_user")        
                                )
                            }
                            
                        })
                    }else{
                        res.status(403).send("Forbidden")
                    }
                // }
                // else{
                //     res.status(422).send('captcha_error');
                // }
        //     }
        // );
        
    }else{
        res.status(403).send("Forbidden")
    }
};

var getErrorMessageCard = function(key){
    key = parseInt(key) + 1;
    var error_array = [
        'Giao dịch thành công',
        'Lỗi, tuy nhiên lỗi chưa được định nghĩa hoặc chưa xác định được nguyên nhân',
        'Lỗi, địa chỉ IP truy cập API của NgânLượng.vn bị từ chối',
        'Lỗi, tham số gửi từ merchant tới NgânLượng.vn chưa chính xác (thường sai tên tham số hoặc thiếu tham số)',
        'Lỗi, Mã merchant không tồn tại hoặc merchant đang bị khóa kết nối tới NgânLượng.vn',
        'Lỗi, Mã checksum không chính xác (lỗi này thường xảy ra khi mật khẩu giao tiếp giữa merchant và NgânLượng.vn không chính xác, hoặc cách sắp xếp các tham số trong biến params không đúng)',
        'Tài khoản nhận tiền nạp của merchant không tồn tại',
        'Tài khoản nhận tiền nạp của merchant đang bị khóa hoặc bị phong tỏa, không thể thực hiện được giao dịch nạp tiền',
        'Thẻ đã được sử dụng ',
        'Thẻ bị khóa',
        'Thẻ hết hạn sử dụng',
        'Thẻ chưa được kích hoạt hoặc không tồn tại',
        'Mã thẻ sai định dạng',
        'Sai số serial của thẻ',
        'Mã thẻ và số serial không khớp',
        'Thẻ không tồn tại',
        'Thẻ không sử dụng được',
        'Số lần thử (nhập sai liên tiếp) của thẻ vượt quá giới hạn cho phép',
        'Hệ thống Telco bị lỗi hoặc quá tải, thẻ chưa bị trừ',
        'Hệ thống Telco bị lỗi hoặc quá tải, thẻ có thể bị trừ, cần phối hợp với NgânLượng.vn để tra soát',
        'Kết nối từ NgânLượng.vn tới hệ thống Telco bị lỗi, thẻ chưa bị trừ (thường do lỗi kết nối giữa NgânLượng.vn với Telco, ví dụ sai tham số kết nối, mà không liên quan đến merchant)',
        'Kết nối tới telco thành công, thẻ bị trừ nhưng chưa cộng tiền trên NgânLượng.vn'
    ];
    return error_array[key]
}

var getNameCard = function(key){
    var name_array = ['VMS','VNP', 'VIETTEL', 'VCOIN', 'GATE' , 'MobiFone','VinaPhone','Viettel','Vcoin','Gate'];

    return _.indexOf(name_array, key) === -1 ? null : name_array[_.indexOf(name_array, key) + 5];
}

exports.napCard = function(req, res, next){

    if(!_.isUndefined(req.user) && !_.isUndefined(req.body) && _.size(req.body) > 2 && !_.isUndefined(req.body.cardCode) && !_.isUndefined(req.body.seri) && !_.isUndefined(req.body.tc_code) && req.body.seri % 1 === 0 && req.body.tc_code % 1 === 0 ){
        var datenow = new Date();
        var hrTime = process.hrtime();
        var mcTime = hrTime[0] * 1000000 + hrTime[1] / 100;
        var data_push = {};
        mcTime = mcTime.toString().split('.'), mcTime = mcTime[1];
        if(req.method === 'PUT'){
            var data = {
                func: config.nganluong_napcard.func,
                version : config.nganluong_napcard.version,
                merchant_id : config.nganluong_napcard.merchant_id,
                merchant_account : config.nganluong_napcard.merchant_account,

                merchant_password : md5(config.nganluong_napcard.merchant_id + "|" + config.nganluong_napcard.merchant_password),

                pin_card : req.body.tc_code.toString(),
                card_serial : req.body.seri.toString(),
                type_card : req.body.cardCode.toString(),
                ref_code : req.user._id.toString(),
                client_fullname : req.user.fullname === '' ? '' : req.user.fullname,
                client_email : req.user.isEmail === true ? req.user.email : '',
                client_mobile : req.user.isPhone === true ? req.user.telephone : '' 
            };
           
            var params = ''; 
            _.each(data , function(value, key){
                params === '' ? (
                    params = '?'
                ) : (
                    params += '&'
                );
                params += key + "=" + value ;
            })

            request({
                url: config.nganluong_napcard.merchant_url + params,
                headers: {
                    "content-type": "text/html; charset=utf-8"
                },
            }, function (error, response, body){
                body = body.split('|');
                body[0] === '00' ? ( 
                    User.findById(body[6], function(err, user){
                        if(!err && _.size(user) > 0){
                             var amount_card = (parseInt(body[10]) / 1000) * 0.8 ;
                             user.k_number += amount_card;

                             User.update({
                                _id : user._id
                             }, {
                                $push : {
                                    history_oder : {
                                        date_create : datenow,
                                        payment_method : 'Nạp thẻ cào: ' + getNameCard(req.body.cardCode),
                                        total_amount : '+' + (amount_card).toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1."),
                                        order_description : "Mệnh giá thẻ cào là: "+body[10].toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1.")+" đ",
                                        transaction_status : '00',
                                        state : true
                                    }
                                },
                                k_number : user.k_number
                             }, function(err, result) {
                                !err ? ( 
                                    ControlUser.updateNotifyMess([{ _id: user._id }], 'my_wallet', function(result){
                                        !_.isUndefined(process.socket) && (
                                            process.socket.emit('customer:my_wallet', {
                                                'partner_id': user._id
                                            }),
                                            process.socket.broadcast.emit('customer:my_wallet', {
                                                'partner_id': user._id
                                            })
                                        ),
                                        Notification5k.sendNotificationforOneUser("Bạn vừa nạp thẻ cào là: "+body[10].toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1.")+" đ", user._id)
                                    }),
                                    data_push = {
                                        partner_id : [user._id, user.email],
                                        amount : amount_card,
                                        date_exchange : datenow,
                                        type_exchange : 'addition',
                                        millisecond : parseInt(mcTime)
                                    },
                                    publisher.publisher('website_transactionK', data_push, function(cb){
                                        //neu err save err to website_transactionK
                                        !cb && (
                                            new websiteTransactionK_error(data_push).save(function(err, result){})
                                        )
                                        res.send( {
                                            card_money : body[10].toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1."),
                                            k_result : amount_card
                                        })

                                    }) 

                                ) : (
                                    res.status(402).send()
                                )
                             });
                        }else{
                            res.status(422).send();
                        }
                    })
                ) : (
                    res.status(403).send(getErrorMessageCard(body[0]))
                )
            });
        }
    }else{
        res.status(422).send();
    }

    
}

/**
 * Change pass and send email for forgot password
 */
exports.sendEmailForgot = function(req, res) {
    
    if(req.method === 'PUT'){
        // request.post('https://www.google.com/recaptcha/api/siteverify', 
        //     {form:{ secret: "6LceSBwUAAAAAFedcS6iJ415Xs6LQj2ewl_icrA0", response : req.body.response }}, 
        //     function(error, response, body){
                // body = JSON.parse(body.toString())
                // error === null && body.success === true ? (
                    !_.isUndefined(req.body.id) && (
                        User.findById(req.body.id, function(err, user){
                            if (!err && user.isEmail === true){
                                var smtpTransport = mailer.createTransport({
                                    service: config.email.service,
                                    auth: config.email.auth
                                });
                                var ranString = randomstring.generate(100);
                                String.prototype.capitalize = function() {
                                    return this.replace(/(?:^|\s)\S/g, function(a) { return a.toUpperCase(); });
                                }
                                var name_tmp = user.fullname ? user.fullname.capitalize().toString() : md5(user._id);
                                var mail = {
                                    from: config.email.from,
                                    to: user.email,
                                    subject: "Email quên mật khẩu",
                                    html: "<div>"
                                        +"<p>"
                                        +'<img src="'+config.domain+'/assets/images/themes/10K%20MARKET3-09.png" width="240px" height="68px" alt="LOGO" />'
                                        +'<a href="'+config.domain+'/ung-dung.html" style="float:right;">'
                                        +'<img src="http://s-media-cache-ak0.pinimg.com/originals/e7/4a/f4/e74af471e9c2788c388b353543418765.png" width="105px" height="70px" alt="Link download App" />'
                                        +'</a>'
                                        +"</p>"    
                                        +"<p>Xin chào <strong>"+name_tmp+"</strong> ,</p>"
                                        +"<p>Vui lòng truy cập link sau để đặt lại mật khẩu: </p>"
                                        +'<p><a href="'+config.domain+'/thay-doi-mat-khau/'+ranString+'/'+req.body.id+'.html"><strong>"Link reset password"</strong></a></p>'
                                        +"<p>Liên kết này có giá trị cho một lần dùng. Cảm ơn bạn đã liên hệ với chúng tôi.</p>"
                                        +"<p>Trân trọng,</p>"
                                        +"<p><strong>Mua5K Team!</strong></p></div>"
                                        +"</div>"
                                };
                                smtpTransport.sendMail(mail, function(error, response){       
                                    if(error === null){
                                        user.update({
                                            string_fogot_passwd : ranString
                                        }, function(err, result){
                                            if(err){
                                                res.status(403).send("request_server");
                                            }else{
                                                res.send({email : 'ok'})
                                            }
                                        });
                                    }else{
                                        res.status(403).send("server_email");
                                    }
                                });
                            }else{
                                res.status(403).send("request_server");
                            }
                        })
                    )
                // ) : (
                //     res.status(403).send("captcha_error")
                // )
        //     }
        // );

    }else{
        res.status(403).send("request_server");
    }
    
};

exports.checkHaskTringFogotPasswd = function(req, res, next){
    if(req.method === 'PUT'){
        if (_.size(req.body) > 0 && !_.isUndefined(req.body.string)  && !_.isUndefined(req.body.id) ){
            User.findOne({
                _id : req.body.id,
                string_fogot_passwd : req.body.string
            }, function(err, user){
                (err === null && _.size(user) > 0) ? res.status(200).send() : ( res.status(403).send() );
            });
        }else{
            res.status(403).send();
        }
    }else{
        res.status(403).send();
    }
    
};

exports.CapNhapMK = function(req, res, next){
    if(req.method === 'PUT'){
        if(_.size(req.body) > 2 && !_.isUndefined(req.body.hash) && !_.isUndefined(req.body.id) && !_.isUndefined(req.body.session) ){
            if(!_.isUndefined(req.body.session.password) && !_.isUndefined(req.body.session.rePassword) && req.body.session.password === req.body.session.rePassword){
                User.findOne({
                    _id : req.body.id,
                    string_fogot_passwd : req.body.hash
                }, function(err, user){
                    (err === null && _.size(user) > 0) ? (
                        user.string_fogot_passwd =  md5(new Date()),
                        user.password = req.body.session.password,
                        user.password_input = req.body.session.password,
                        user.update(user, function(err, result){
                            err === null ? (
                                publisher.publisher('website_customer', user, function(cb){
                                    !cb && new errUser(user).save(function(err, result){})
                                }),

                                res.status(200).send()
                            ) : (
                                res.status(403).send() 
                            )
                        })
                    ) : (
                        res.status(403).send()
                    )
                });
            }else{
                res.status(403).send(); 
            }
        }else{
          res.status(403).send();  
        }
    }else{
        res.status(403).send();
    }
};

/**
 * Create new user login by provider
 */
exports.createUserbyProvider = function(req, res, next){
    var timeout = new Date();
    timeout.setMinutes(timeout.getMinutes() + 3);
    req.body.code = randomstring.generate(10);
    req.body.password = req.body.password_input;
    req.body.last_day_of_month = new Date(new Date().getFullYear(), new Date().getMonth(), 0).getDate();
    new User(req.body)
        .save(function(err, user) {
            !err ? (
                publisher.publisher('website_customer', user, function(cb){
                    !cb && new errUser(user).save(function(err, result){})
                }),
                res.status(200).json(user)
            ) : (
            res.status(403).send('Forbidden')
            )
        })
 };

 /**
 * Edit user login by provider
 */
exports.editUserbyProvider = function(req, res, next){
    var userId = req.body.id;
    User.findById(userId , function(err, user){
        if (err)
            res.status(403).send()
        else {
            user.password = req.body.password_input;
            user.password_input = req.body.password_input;
            user.avatar = req.body.avatar;
            user.fullname = req.body.fullname;
            user.email = req.body.email;
            user.update(user, function(err, result){
                if (err)
                    res.status(403).send()
                else {
                    publisher.publisher('website_customer', user, function(cb){
                        !cb && new errUser(user).save(function(err, result){})
                    });
                    res.status(200).json({ token: jwt.sign({ _id: user._id }, config.secrets.session, { expiresIn: 60 * 60 * 5 }), user: user });
                }
            });
        }
            
    });
 };

 /**
 *  Get user by phone, email
 */
exports.getUserbyPhoneEmail = function(req, res, next) {
    var email = req.body.email;
    User.findOne({
        $or : [
            { email: email.toLowerCase()},
            { telephone : email.toLowerCase()}
        ]
        
    }, function(err, user) {
        return (!user || err) ? res.status(403).send('Forbidden') : res.json(user);
    });
 };

/** 
*   Get Count Message Notify Has Status Is False By Type == unread
*/
exports.getNotifyWaitingResult = function(req, res, next) {
    User.aggregate([
        {
            $match: {
                _id : mongoose.Types.ObjectId(req.params.id)
            }
        },
        {
            $project: {
                _id: !1,
                notify_mess: 1,
            }  
        },
        {
            $unwind: '$notify_mess'
        },
        {
            $match: {
                'notify_mess.state': false
            }
        },
        {
            $group: {
                _id: '$notify_mess.type',
                count: { $sum: 1}
            }
        }
    ]).exec(function(err, results){
        !err && _.size(results) > 0 ? (
            res.status(200).json(results)
        ) : (
            res.status(403).send()
        )
    });
 };

/**
*   Update Status Notify to True by Type = read
*/
exports.resetNotifyMess = function(req, res, next) {
    User.findOne({
        _id: mongoose.Types.ObjectId(req.body.id),
        'notify_mess.type': req.body.type,
        'notify_mess.state': false,
    }, function(err, user) {
        !err && user ? (
            user.notify_mess.map(function(notify) {
                if (notify.type === req.body.type && !notify.state) {
                    notify.state = true;
                }
            }),
            User.update({
                _id: mongoose.Types.ObjectId(req.body.id)
            },
            {
                $set: {notify_mess: user.notify_mess}
            }, function(err, result){
                !err ? (
                    !_.isUndefined(process.socket) && (
                        process.socket.emit('notify:resetbytype', {
                            type: req.body.type,
                            id: req.body.id
                        }),
                        process.socket.broadcast.emit('notify:resetbytype', {
                            type: req.body.type,
                            id: req.body.id
                        })
                        ),
                    res.status(200).send()
                ) : (
                    res.status(403).send()
                )
            })
        ) : (
            res.status(403).send()
        )
    })
 };

/**
*   Update Status Of Popup In The First Login For Give K To User
*/
exports.updateStatusNotifyLogin = function(req, res, next) {
    User.findOne({
        _id: mongoose.Types.ObjectId(req.body.id),
    }, function(err, user){
        (err === null && _.size(user) > 0) ? (
            user.popup_first_login = true,
            user.update(user, function(err, result){
                err === null ? (
                    res.status(200).send()
                ) : (
                    res.status(403).send() 
                )
            })
        ) : (
            res.status(403).send()
        )
    });
 };

/**
*   Get All New Notify Of User
*/
var getListNewNotifybyUser = function(req, res, next) {

    var queryParameters = null,
        notify_ids = [],
        notify_sort = [];
    User.aggregate([
        {
            $match: {
                _id: mongoose.Types.ObjectId(req.params.id)
            }
        },
        {
            $project: {
                _id: !1,
                notify_mess: 1
            }
        },
        {
            $unwind: "$notify_mess"
        },
        {
            $match: {
                'notify_mess.type': 'other'
            }
        },
        {
            $project: {
                state: '$notify_mess.state',
                notify_id: '$notify_mess.notify_id',
                type: '$notify_mess.type',
                date_create: '$notify_mess.date_create',
                id: '$notify_mess.id'
            }
        },
        {
            $sort: {
                id: -1
            }
        }
    ]).exec(function(err, notifys) {
        !err && _.size(notifys) > 0 ? (
            notify_ids = _.map(notifys, function(notify){
                return notify.notify_id;
            }),
            New_Notify.count({
                id: { $in: notify_ids}
            }, function(err, count){
                !err && count > 0 ? (
                    queryParameters = paginate(req, res, count, 20),
                    New_Notify.aggregate([
                        {
                            $match: {
                                id: { $in: notify_ids}
                            }
                        },
                        {
                            $project: {
                                _id: 1,
                                title: 1,
                                id: 1,
                                slug: 1,
                                date_create: 1,
                            }
                        },
                        {
                            $sort: {
                                id: -1
                            }
                        }
                    ])
                    .skip(queryParameters.skip)
                    .limit(queryParameters.limit)
                    .exec(function(err, results){
                        !err && _.size(results) > 0 ? (
                            results.forEach(function(result, index){
                                results[index].sequence = notify_ids.indexOf(result.id) + 1;
                                results[index].state = notifys[notify_ids.indexOf(result.id)].state;
                                results[index].date = notifys[notify_ids.indexOf(result.id)].date_create;
                            }),
                            res.send({results: results, count: count})
                        ) : (
                            res.send({results: [], count: 0})
                        )
                    })
                ) : (
                    res.send({results: [], count: 0})
                )
            })
        ) : (
            res.send({results: [], count: 0})
        )
    });
};

exports.getListNewNotify = function(req, res, next) {
    return getListNewNotifybyUser(req, res, next);
};

exports.getListNewNotify_tmp = function(req, res, next) {
    return getListNewNotifybyUser(req, res, next);
};
/**
*   Get Notify and Update Status Mess Notify
*/
exports.getDetailNewNotify = function(req, res, next) {
    New_Notify.findOne({slug: req.body.slug}, function(err, notify) {
        !err && notify ? (
            User.findOne({
                _id: mongoose.Types.ObjectId(req.body.user_id),
                'notify_mess.notify_id': notify.id,
                'notify_mess.state': false,
            }, function(err, user) {
                var is_send = false;
                !err && user && (
                    user.notify_mess.map(function(data) {
                        if (data.notify_id === notify.id && !data.state) {
                            data.state = true;
                            is_send = true;
                        }
                    }),
                    User.update({
                        _id: mongoose.Types.ObjectId(req.body.user_id)
                    },
                    {
                        $set: {notify_mess: user.notify_mess}
                    }, function(err, result){
                        !err && is_send
                        && (
                            !_.isUndefined(process.socket) && (
                                process.socket.emit('notify:resetbytype', {
                                    type: 'other',
                                    id: req.body.user_id
                                }),
                                process.socket.broadcast.emit('notify:resetbytype', {
                                    type: 'other',
                                    id: req.body.user_id
                                })
                            )
                        )
                    })
                )
            }),
            res.status(200).send(notify)
        ) : (
            res.status(403).send()
        )
    });
}
/**
*   VNPT EPAY TOPUP
**/
// exports.makeVNPTEpayTopup = function(req, res, next) {
//     if(req.method === 'PUT' && req.body.provider && req.body.target && req.body.amount) {
//         if ( config.vnptepay.VNPT_EPAY_PROVIDER[req.body.provider] ) {
//             if ( config.vnptepay.VNPT_EPAY_HEAD_NUMBER[req.body.provider] 
//                 && ( config.vnptepay.VNPT_EPAY_HEAD_NUMBER[req.body.provider].indexOf(req.body.target.substring(0,4)) > -1 
//                         || config.vnptepay.VNPT_EPAY_HEAD_NUMBER[req.body.provider].indexOf(req.body.target.substring(0,3)) > -1 
//                     ) 
//             ) {
//                 if ( config.vnptepay.VNPT_EPAY_AMOUNT_MOBILE_CARD[req.body.provider] && config.vnptepay.VNPT_EPAY_AMOUNT_MOBILE_CARD[req.body.provider].indexOf(parseInt(req.body.amount)) > -1 ) {
//                     User.findById(req.body.id, function(err, user){
//                         if (!err && user) {
//                             if (user.k_number >= parseInt(req.body.amount) / 1000) {
//                                 var data = {
//                                     requestId : config.vnptepay.partnerName +'_'+ (new Date()).getTime() + Math.floor(Math.random()*(999-100+1)+999),
//                                     partnerName : config.vnptepay.partnerName,
//                                     provider : req.body.provider,
//                                     target : req.body.target,
//                                     amount : req.body.amount,
//                                 };
//                                 return vnptepay.sign(data, user, res);
//                             } else {
//                                 return res.status(403).send({message_err:  'Bạn không đủ số K để thực hiện giao dịch này.'});
//                             }
//                         } else {
//                             return res.status(401).send('Unauthorized');
//                         }
//                     });   
//                 } else {
//                     return res.status(403).send({message_err: 'Mệnh giá nạp tiền không hỗ trợ.'});
//                 }
//             } else {
//                 return res.status(403).send({message_err: 'Sai đầu số của số điện thoại cần nạp.'});
//             }
//         } else {
//             return res.status(403).send({message_err: 'Sai mã nhà cung cấp hoặc nhà cung cấp hệ thống không hỗ trợ.'});
//         }
//     }
// }
 /**
 *  Remove user
 */
exports.removeUser = function(req, res, next) {
    User.findByIdAndRemove(req.params.id, function(err, user) {
        if (err) return res.status(500).send(err);
        return res.status(204).send('No Content');
    });
};