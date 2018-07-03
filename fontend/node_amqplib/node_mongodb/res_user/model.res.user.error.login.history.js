'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var UserErrorHistoryLoginSchema = new Schema({
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
    year_of_birth : {type : String , default : '1900'},
    day_of_birth : {type : String , default : '01'},
    
    ip: {type : String , default : ''},
    region : {type : String , default : ''},
    login_date : {type: Date, default: Date.now}
});


module.exports = mongoose.model('rpm_customer_error_history_login', UserErrorHistoryLoginSchema);