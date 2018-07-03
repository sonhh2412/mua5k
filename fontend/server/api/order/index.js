'use strict';

var express = require('express');
var controller = require('./order.controller');
var auth = require('../../auth/auth.service');

var router = express.Router();

router.get('/listorderbyuser/:id', auth.isAuthenticated(), controller.listorderbyuser);

router.get('/getStatebyId/:id', auth.isAuthenticated(), controller.getStatebyId);

module.exports = router;
