'use strict';

var express = require('express');
var controller = require('./category.controller');


var router = express.Router();

router.get('/getCateg', controller.getCateg);

router.get('/getChild/:id', controller.getChild);
router.get('/getSlug/:slug', controller.getSlug);

router.get('/getCategBuyFast', controller.getCategBuyFast);


module.exports = router;
