'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var HelpContentSchema = new Schema({
  id : Number,
  title: String,
  content: String,
  slug: String,
  state: Number
});

module.exports = mongoose.model('rpm_help_content', HelpContentSchema);