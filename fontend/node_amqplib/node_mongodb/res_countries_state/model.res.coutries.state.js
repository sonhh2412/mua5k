'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var CountryStatechema = new Schema({
  code: String,
  id: Number,
  name: String,
  countries_id : Number,
});


module.exports = mongoose.model('rmp_res_countries_state', CountryStatechema);

