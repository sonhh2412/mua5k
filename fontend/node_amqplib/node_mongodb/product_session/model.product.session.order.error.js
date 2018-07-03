'use strict';


var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var ProductSessionOrderErrorSchema = new Schema({

  session_id : { type : Number, require: !0 },
  code : {
    type : Array , default : []
  },

  time : String,
  user_order : {
    type : Array , default : []
  }
});



module.exports = mongoose.model('rmp_product_session_order_error', ProductSessionOrderErrorSchema);

