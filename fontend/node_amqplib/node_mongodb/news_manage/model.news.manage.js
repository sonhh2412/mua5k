'use strict';

var mongoose = require('mongoose'),
    NewsSchema = mongoose.Schema;

var NewsSchema = new NewsSchema({
  title: String,
  slug: String,
  content: String,
  sequence: { type: Number, default: 1},
  publish: { type: Date, default: Date.now},
  state: Number
});

module.exports = mongoose.model('rpm_news_content', NewsSchema);