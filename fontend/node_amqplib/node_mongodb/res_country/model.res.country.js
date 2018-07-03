'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var Countrychema = new Schema({
  id : Number,
  code: String,
  name: String,

});



module.exports = mongoose.model('rmp_res_country', Countrychema);