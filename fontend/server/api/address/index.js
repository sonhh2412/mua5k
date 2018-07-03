'use strict';

var express = require('express');
var controller = require('./address.controller');


var router = express.Router();

router.get('/getCountrystate', controller.getCountrystate);

module.exports = router;
