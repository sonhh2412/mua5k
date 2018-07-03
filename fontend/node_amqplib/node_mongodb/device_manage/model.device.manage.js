'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var DeviceManageSchema = new Schema({
  token_id: String,
  isSendNotification: { type: Boolean, default: false },
  created: {type: Date, default: Date.now},
});

module.exports = mongoose.model('rpm_device_manage', DeviceManageSchema);