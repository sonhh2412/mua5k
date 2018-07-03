'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var NotifySchema = new Schema({
    title: String,
    content: String,
    type_notify: String,
    id: Number,
    slug: String,
    date_create: {type: Date, default: Date.now},
});


module.exports = mongoose.model('rpm_notify_content', NotifySchema);