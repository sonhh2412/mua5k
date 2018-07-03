'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var DialErrorSchema = new Schema({
    session_id : { type : Number, require: !0 },
    winner_id : { type : String, require: !0 },
    number_win : { type : Number, require: !0 },
    start : { type : String, require: !0 },
    end : { type : String, require: !0 },
    address_id : { type : String, require: !0 }
});


module.exports = mongoose.model('rpm_dial_result_error', DialErrorSchema);