'use strict';

var mongoose = require('mongoose'),
    BannerSchema = mongoose.Schema;

var BannerSchema = new BannerSchema({
  name: String,
  slug: String,
  link_href: String,
  image: String,
  type: String,
  sequence: {type: Number, default: 1},
  state: Number
});

module.exports = mongoose.model('rpm_banner_manage', BannerSchema);