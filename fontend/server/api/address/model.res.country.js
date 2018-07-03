'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var Countrychema = new Schema({
  code: String,
  id: Number,
  name: String,
  updated: {type: Date, default: Date.now},
});


module.exports = mongoose.model('country', Countrychema);