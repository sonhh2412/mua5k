'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var K_Event = new Schema({
  id: Number,
  active : { type: Boolean,  default: false },
  startDate : {type: Date , default : new Date()},
  endDate : {type: Date , default : new Date()},
  k_number : {type: Number , default : 0},
  history : { type : Array , default : [] },
  date : {type: Date , default : new Date()}
});


module.exports = mongoose.model('rmp_k_event', K_Event);

