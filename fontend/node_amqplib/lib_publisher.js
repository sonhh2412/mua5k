'use strict';

// https://www.cloudamqp.com/docs/nodejs.html

var amqp = require('amqplib/callback_api');
var strftime = require('strftime');
var _ = require('lodash');
var dateFormat = require('dateformat');

var website_customer = function(user){
    
    this.web_id = user._id,
    this.name = user.fullname !== '' ? user.fullname : '',
    this.phone = user.telephone ? user.telephone : '',
    this.email = user.email ? user.email : user.telephone,
    this.street = user.street,
    this.state_id = user.state_id,
    this.country_id = user.country_id,
    this.address = user.address,
    this.parent_id = user.parent_id === 0 ? false : user.parent_id,
    this.account = user.email,
    this.password = user.password_input,
    this.password_temp = user.password_input,
    this.month_of_birth = user.month_of_birth,
    this.year_of_birth = user.year_of_birth,
    this.day_of_birth = user.day_of_birth,
    this.gender = user.gender,
    this.signature = user.signature,
    this.register_date = dateFormat(user.created, "yyyy-mm-dd h:MM:ss"),
    this.income_monthly = user.income_monthly,
    this.last_day_of_month = user.last_day_of_month
    this.avantar_link = user.avatar

};

var website_login_history = function(user){ 

    this.partner_id = [ user._id , user.email ],
    this.ip = user.ip,
    this.date_login = strftime('%F %T', user.login_date)
};


var website_transactionK = function(user){
    this.partner_id = user.partner_id,
    this.type_exchange = user.type_exchange,
    this.amount_exchange =  parseInt(user.amount),
    this.date_exchange = strftime('%F %T', user.datenow),
    this.millisecond = user.millisecond

};


var website_order_point = function(order){
    var string_code = '';
    _.each(order.code, function(value){
        string_code += string_code === '' ? value : ';'+value 
    })
    var arrayPush = [];
    arrayPush.push([order.session_id, string_code, order.time, order.user_order]);

    return {data : arrayPush};
}

var website_product_session_add = function(product_id){
    this.product_id = product_id;
    this.number = 10;
}

var website_dial_result = function(order){
    this.session_id = order.session_id;
    this.winner_id = order.winner_id;
    this.number_win = order.number_win;
    this.start = order.start;
    this.end = order.end;
    this.address_id = order.address_id;
}

var render = function(jobs , obj){
  switch (jobs) {
    case 'website_customer':

            return new Buffer(JSON.stringify(new website_customer(obj)));
        break;

    case 'website_login_history':
            return new Buffer(JSON.stringify(new website_login_history(obj)));
        break;
    case 'website_transactionK':
            return new Buffer(JSON.stringify(new website_transactionK(obj)));
        break;
    case 'website_order_point':
            return new Buffer(JSON.stringify(new website_order_point(obj)));
        break;

    case 'website_product_session_add':
            return new Buffer(JSON.stringify(new website_product_session_add(obj)));
        break;
    case 'website_dial_result':
            return new Buffer(JSON.stringify(new website_dial_result(obj)));
        break;
  };
}


exports.publisher = function(jobs, obj ,callback) {
    amqp.connect(process.host_amqp, function(err, conn) {

        if (err) callback(false);
        else {
            conn.createConfirmChannel(function(errCreateChangel, ch) {
                if (errCreateChangel) callback(false);
                else {
                    try {
                        /*ch.publish('', jobs, render(jobs, obj), { persistent: true }, function(errPublisher) {
                            if (errPublisher) callback(false);
                            else {

                                ch.connection.close();
                                conn.on('close', function(){
                                  callback(true);
                                });
                            }
                        });*/

                        ch.assertQueue(jobs, {durable: true});
                        ch.assertExchange(jobs+'_logs', 'fanout', {durable: false});
                        ch.sendToQueue(jobs, render(jobs, obj, ch), { persistent: true }, function(errPublisher) {
                            if (errPublisher) callback(false);
                            else {
                                ch.connection.close();
                                conn.on('close', function(){
                                  callback(true);
                                });
                            }
                        });

                    } catch (e) {
                        callback(false);
                    }
                }
            });
        }
    });
};
