'use strict';


var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var ProductSessionSchema = new Schema({
  product_id : { type : Number, require: !0 },
  session_id : { type : Number, require: !0 },
  code : {
    type : Array , default : []
  },
  finish : { type: Boolean , default : false },
  selled : { type: Number , default : 0 },
  total : { type: Number , default : 0 }
});

ProductSessionSchema
    .virtual('waitting')
    .get(function() {
        return this.total - this.selled
    });


module.exports = mongoose.model('rmp_product_session', ProductSessionSchema);

