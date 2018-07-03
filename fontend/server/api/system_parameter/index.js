'use strict';

var express = require('express');
var controller = require('./system.parameter');
var auth = require('../../auth/auth.service');

var router = express.Router();

router.post('/add-parameter', auth.hasRole('admin'), controller.addParameter);
router.get('/get-list-parameter', controller.getListParameter);
router.get('/get-parameter/:key', controller.getParameterByKey);
router.delete('/removeParamater/:id', auth.hasRole('admin'), controller.removeParamater);

module.exports = router;