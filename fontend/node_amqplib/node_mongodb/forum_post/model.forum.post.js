'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var ForumpostSchema = new Schema({
  title: String,
  slug: String,
  image: String,
  content: String,
  cate_id: Schema.Types.ObjectId,
  cate_slug: String,  
  publish: {type: Date, default: Date.now},
  auth: Schema.Types.ObjectId,
  view: {type: Number, default: 0},
  featured: {type: Number, default: 0},
  comment: Array,
  state: Number
});

module.exports = mongoose.model('rmp_blog_post', ForumpostSchema);