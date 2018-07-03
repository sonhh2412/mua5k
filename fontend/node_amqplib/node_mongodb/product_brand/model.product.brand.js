'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var BrandSchema = new Schema({
  name: {
  	type: String,
  	require: !0,
    trim: !0
  },
  description : String,
  id : Number,
  image : String,
  slug : {
  	type: String,
  	require: !0,
    trim: !0
  },
});


module.exports = mongoose.model('rmp_product_brand', BrandSchema);