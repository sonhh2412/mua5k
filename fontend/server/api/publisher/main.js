'use strict';
var amqp = require('amqplib/callback_api');

var host = 'amqp://user:admin123@@192.168.0.68';
    
var website_customer = function(user){

	this.web_id = user._id,
    this.name = user.fullname !== '' ? user.fullname : '',
    this.phone = user.telephone ? user.telephone : '',
    this.email = user.email,
    this.street = user.street,
    this.state_id = user.state_id === 0 ? false : true,
    this.country_id = user.country_id,
    this.address = user.address,
    this.parent_id = user.parent_id === 0 ? false : user.parent_id,
    this.account = false,
    this.password = user.password_input,
    this.month_of_birth = '01',
    this.year_of_birth = '01',
    this.day_of_birth = '1900',
    this.gender = user.gender,
    this.signature = user.signature,
    this.register_date = user.created.toISOString().replace(/T/, ' ').replace(/\..+/, ''),
    this.income_monthly = user.income_monthly,
    this.last_day_of_month = user.last_day_of_month

};

var render = function(jobs , obj){
	switch (jobs) {
		case 'website_customer':
            return new Buffer(JSON.stringify(new website_customer(obj)));
			break;
	};
	
}


exports.publisher = function(jobs, obj ,callback) {
    amqp.connect(host, function(err, conn) {
        if (err) callback(false);
        else {
            conn.createConfirmChannel(function(errCreateChangel, ch) {
                if (errCreateChangel) callback(false);
                else {
                    try {
                        ch.publish('', jobs, render(jobs, obj), { persistent: true }, function(errPublisher) {
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