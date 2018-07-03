'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var CategoriesSchema = new Schema({
  id : Number,
  name: String,
  description: String,
  image: String,
  slug: String,
  parent_id: String,  
  publish: {type: Date, default: Date.now},
  state: Number
});

module.exports = mongoose.model('rmp_blog_categories', CategoriesSchema);
