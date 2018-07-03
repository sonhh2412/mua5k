'use strict';

var express = require('express');
var controller = require('./brand.controller');
var auth = require('../../auth/auth.service');

var router = express.Router();

router.get('/getBrand/:id', controller.getBrand);

module.exports = router;
