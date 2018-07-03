'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var SystemParameterSchema = new Schema({
	name: {type: String, default: ''},
	key: {type: String, default: ''},
	value: {type: String, default: ''},
	create_date: {type: Date, default: Date.now},
});

module.exports = mongoose.model('rpm_systme_parameter', SystemParameterSchema);