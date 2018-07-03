'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var crypto = require('crypto');
var authTypes = ['github', 'twitter', 'facebook', 'google'];
var mailer = require("nodemailer");
var request = require('request');
var md5 = require('md5');

var K_Even = require('../k_event/model.k.event');

var websiteTransactionK_error = require('./model.website.transactionk.error');

var config = require('../../../server/config/environment');

var UserSchema = new Schema({
    fullname: { type : String, default : '' },

    email: {
        type: String,
        lowercase: true
    },

    role: {
        type: String,
        default: 'user'
    },
    actived: {
        type: Boolean,
        default : false
    },
    code: String,
    telephone : { type : String, default : '' },

    created: {type: Date, default: Date.now},

    timeout : {type: Date, default: Date.now},

    avatar:{type: String, default:'/assets/images/themes/user-profile1-11.png'},

    hashedPassword: String, //password login
    provider: { type : String, default : 'local' }, // loai login local, facebook, google
    salt: String, // rangdom hash password
    address: {type : Array , default : []},

    street : { type : String, default : '' },
    state_id : { type : Number , default : 0},
    country_id : { type : Number , default : 243}, 
    parent_id : {type : Number , default : 0},
    password_input : String,
    income_monthly : { type: Number , default : 0 },
    last_day_of_month : Number,
    gender : {type: String, default : 'male'},
    signature : {type : String , default : ''},
    month_of_birth : {type : String , default : '01'},
    year_of_birth : {type : Number , default : 1900},
    day_of_birth : {type : String , default : '01'},
    
    ip: {type : String , default : ''},
    region : {type : String , default : ''},
    login_date : {type: Date, default: Date.now},
    history_oder: {type : Array , default : []},
    k_number : { type : Number , default : 0},
    visitor: {type : Array , default : []},
    history_transfer: {type : Array , default : []},
    isPhone : {type : Boolean , default : false},
    isEmail : {type : Boolean , default : false},
    count_sms : { type : Number , default : 0},
    string_fogot_passwd : {type : String , default : ''},
    count_sms_day :{ type : Number , default : 0},
    timeout_fogot_passwd : {type: Date},

    popup_first_login : { type : Boolean, default: false },
    number_k_give : { type: Number, default: 0 },
    notify_mess: {type : Array, default : []},
    tokenApps: { type: Array, default: [] },
    show_guide: { type : Number, default : 0 },
    history_topup: {type : Array , default : []},
});

/**
 * Virtuals
 */
UserSchema
    .virtual('password')
    .set(function(password) {
        this._password = password;
        this.salt = this.makeSalt();
        this.hashedPassword = this.encryptPassword(password);
    })
    .get(function() {
        return this._password;
    });

// Public profile information
UserSchema
    .virtual('profile')
    .get(function() {
        return {
            'email': this.email,
            'role': this.role,
            'created' : this.created,
            'k_number' : this.k_number
        };
    });

UserSchema
    .virtual('getAddres')
    .get(function() {
        return this.address;
    });

// Public profile information
UserSchema
    .virtual('getActive')
    .get(function() {
        return {
            'email': this.email ? this.email : this.telephone,
            // 'timeout' : this.timeout,
            'timeout': (this.timeout - new Date()) / 1000 > 0 ? (this.timeout - new Date()) / 1000 : 0,
            'actived': this.actived,
            'isEmail' : this.isEmail,
            'isPhone' : this.isPhone
        };
    });

// Non-sensitive info we'll be putting in the token
UserSchema
    .virtual('token')
    .get(function() {
        return {
            '_id': this._id,
            'role': this.role
        };
    });

/**
 * Validations
 */

// Validate email is not taken
UserSchema
    .path('email')
    .validate(function(value, respond) {
        var self = this;
        self.constructor.findOne({
            'email': value
        }, function(err1, user1) {
            if (err1) throw err;
            if (user1) {
                return respond(false);
            } else {
                return respond(true);
            }
        });

    }, 'email_token');

// Validate telephone is not taken
UserSchema
    .path('telephone')
    .validate(function(value, respond) {
      var self = this;

        value !== '' && ( 
          
          self.constructor.findOne({
              'telephone': value
          }, function(err1, user1) {
              if (err1) throw err;
              if (user1) {
                  return respond(false);
              } else {
                  return respond(true);
              }
          })
        ) ;
        if (value === '') return respond(true);
    }, 'telephone_token');

var validatePresenceOf = function(value) {
    return value && value.length;
};

/**
 * Pre-save hook
 */
UserSchema
    .pre('save', function(next) {
        if (!this.isNew) return next();

        if (!validatePresenceOf(this.hashedPassword) && authTypes.indexOf(this.provider) === -1)
            next(new Error('Invalid password'));
        else
            next();
    });

/**
 * Methods
 */
UserSchema.methods = {

      authenticate: function(plainText) {
        return this.encryptPassword(plainText) === this.hashedPassword;
      },

    makeSalt: function() {
        return crypto.randomBytes(16).toString('base64');
    },


    encryptPassword: function(password) {
        if (!password || !this.salt) return '';
        var salt = new Buffer(this.salt, 'base64');
        return crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha1').toString('base64');
    }
};

/**
 * Send email for user
 */

UserSchema.post('save', function(doc) {
    var self = this;
    var data_push = {};

    var datenow = new Date();
    
    var hrTime = process.hrtime();
    var mcTime = hrTime[0] * 1000000 + hrTime[1] / 100;
    mcTime = mcTime.toString().split('.'), mcTime = mcTime[1];

    K_Even.findOne({}, function(err, event){
        if (!err && event) {
            var start = event.startDate,
                end = event.endDate,
                k_number = event.k_number,
                active = event.active,
                now = new Date();

            //  &&
            now >= new Date(start) && now <= new Date(end) && active === true && k_number > 0 && (

                self.constructor.update({
                    '_id': doc._id
                } , {
                    k_number : k_number,
                    number_k_give : k_number
                }, function(err, user) {
                    !err && (
                        data_push = {
                            partner_id : [doc._id, doc.email],
                            amount : parseInt(k_number),
                            date_exchange : datenow,
                            type_exchange : 'addition',
                            millisecond : parseInt(mcTime)
                        },
                        new websiteTransactionK_error(data_push).save(function(err, result){})
                    )
                })
            )
        }
    });
    if (doc.provider == 'local') {

        if(doc.isPhone === true){
            var phone = doc.telephone.indexOf( '0' ) === 0 ? doc.telephone = doc.telephone.replace( '0', '' ) : doc.telephone;
            var data = {
                cmdCode: config.sms.cmdCode,
                alias :  config.sms.alias,
                message : config.sms.createUser + doc.code + config.sms.descriptionUser,
                sendTime : config.sms.sendTime,
                authenticateUser : config.sms.authenticateUser,
                authenticatePass :  config.sms.authenticatePass,
                msisdn : config.sms.msisdn + phone
            };

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
                console.log('send sms create user',error, body);
            });
            
        }else{
            setTimeout(function() {
               var smtpTransport = mailer.createTransport({
                   service: config.email.service,
                   auth: config.email.auth
               });
               String.prototype.capitalize = function() {
                    return this.replace(/(?:^|\s)\S/g, function(a) { return a.toUpperCase(); });
                }
               var name_tmp = doc.fullname ? doc.fullname.capitalize().toString() : md5(doc._id);
               var mail = {
                   from: config.email.from,
                   to: doc.email,
                   subject: "Xác nhận đăng ký",
                   html: "<div>"
                        +"<p>"
                        +'<img src="'+config.domain+'/assets/images/themes/10K%20MARKET3-09.png" width="240px" height="68px" alt="LOGO" />'
                        +'<a href="'+config.domain+'/ung-dung.html" style="float:right;">'
                        +'<img src="http://s-media-cache-ak0.pinimg.com/originals/e7/4a/f4/e74af471e9c2788c388b353543418765.png" width="105px" height="70px" alt="Link down App" />'
                        +'</a>'
                        +"</p>"
                        +"<p>Xin chào <strong>"+name_tmp+"</strong> ,</p>"
                        +'<p>Chào mừng bạn đến với <a href="mua5k.com">mua5k.com</a>!</p>'
                        +"<p> Vui lòng bấm vào Link sau để xác nhận đăng ký tài khoản:</p>"
                        +"<br/>"
                        +'<a href="'+config.domain+'/xac-minh-tai-khoan/'+doc._id+'/'+doc.code+'.html">Link xác minh tài khoản</a>'
                        +"<br/>"
                        +"<br/>"
                        +'<p>Chúc quý khách hàng mua sắm vui vẻ và có một ngày tốt lành tại <a href="mua5k.com">mua5k.com</a></p>'
                        +"<p>Trân trọng,</p>"
                        +"<p><strong>Mua5K Team!</strong></p></div>"

               }

               smtpTransport.sendMail(mail, function(error, response){       
                   smtpTransport.close();
               });
            }, 1000);
        }

        
    }
});


// UserSchema.post('findOneAndUpdate', function(doc) {
    
//     if('function' == typeof process.socket.emit){
//         process.socket.emit('user:save', doc);
//         process.socket.broadcast.emit('user:save', doc);
//     }
    
// });


module.exports = mongoose.model('rpm_customer', UserSchema);
