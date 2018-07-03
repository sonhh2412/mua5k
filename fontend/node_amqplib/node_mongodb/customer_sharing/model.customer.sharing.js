'use strict';

var mongoose = require('mongoose'),
    CustomerSharingSchema = mongoose.Schema;

var CustomerSharingSchema = new CustomerSharingSchema({
  name: String,
  slug: String,
  content: String,
  image_main : String,
  images: { type: Array, default : [] },
  user: {type: Array, default: [], require: !0},
  product: {type: Array, default : [], require: !0},
  session: {type: Array, default: [], require: !0},
  publish: {type: Date, default: Date.now},
  like: { type: Array, default: [] },
  comment: { type: Array, default: [] },
  view: {type: Number, default: 0},
});

module.exports = mongoose.model('rpm_customer_sharing', CustomerSharingSchema);