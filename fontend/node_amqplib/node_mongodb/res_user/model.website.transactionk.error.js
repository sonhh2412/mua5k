'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var websiteTransactionK_error = new Schema({
    partner_id : {type : Array , default : []},
    amount : { type : Number , default : 0},
    date_exchange : { type : String, default : '' },
    type_exchange : { type : String, default : '' },
    millisecond :  { type : String, default : '' }
});


module.exports = mongoose.model('rpm_website_transaction_k_error', websiteTransactionK_error);