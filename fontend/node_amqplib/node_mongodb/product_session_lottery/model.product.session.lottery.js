'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var Product_Session_Lottery_Schema = new Schema({
  id : { type : Number, require: !0, },

  slug: { type : String, require: !0, trim: !0 },

  name: { type: String, require: !0, trim: !0 },

  price : { type : Number, default : 0 },

  session_id : { type : Number, default : 0 },

  session_number : { type : Number, default : 0},

  description : { type : String, trim: !0 },

  lottery : { type: Boolean,  default: false },

  descriptionSale : { type : String, default : '' },

  default_code : String,

  images : { type: Array, default : [] },

  convert : { type : Array, default : [] },
  code : { type : Array, default : [] },

  date : { type: Date, default: Date.now },
  total : { type : Number, default : 0 },

  user_win : { type: Array, default : [] },

  array_byer : { type: Array, default : [] },

  limited : { type: Boolean, default : false },

});


module.exports = mongoose.model('rmp_product_session_lottery', Product_Session_Lottery_Schema);