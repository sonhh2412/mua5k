'use strict';

var express = require('express');
var controller = require('./controller.hook');

var router = express.Router();

router.get('/get-count' , controller.getCount);
router.get('/get-list' , controller.getList);
module.exports = router;