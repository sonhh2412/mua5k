'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var ProductSessionOrderDialSchema = new Schema({
  note:  { type : String, default : '' },
  state: { type : String, default : '' },
  name: { type : String, default : '' },
  lines: { type : Array, default : [] },
  state_string: { type : String, default : '' },
  shipper_id: { type : String, default : '' },
  partner_id: { type : String, default : '' },
  id: { type : Number, default : 0 },
  description: { type : Array, default : [] },
  date : {type: Date , default : new Date()}
});


module.exports = mongoose.model('rmp_product_order_dial', ProductSessionOrderDialSchema);

