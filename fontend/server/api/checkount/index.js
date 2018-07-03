'use strict';

var express = require('express');
var controller = require('./checkout.controller');
var auth = require('../../auth/auth.service');
var router = express.Router();

router.get('/one/:product_id/:qty', auth.isAuthenticated(), controller.checkountOne);
router.get('/getCountUserBuyInSession/:product_id', auth.isAuthenticated(), controller.getCountUserBuyInSession);
router.get('/findProductBy_ID/:_id', controller.findProductBy_ID);

router.get('/getCheckoutLimit', controller.getCheckoutLimit);

router.post('/checkountAllCart', auth.isAuthenticated(), controller.checkountAllCart);

module.exports = router;

