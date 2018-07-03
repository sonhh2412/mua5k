'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var Countrychema = new Schema({
  code: String,
  id: Number,
  name: String,
  countries_id : Number,
  updated: {type: Date, default: Date.now},
});



Countrychema.virtual("countryId").set(function(countryId) {
    this.countries_id = countryId;
}),


module.exports = mongoose.model('countries_state', Countrychema);

