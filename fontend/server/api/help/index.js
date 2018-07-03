'use strict';

var express = require('express');
var controller_help_content = require('./help.controller');
var auth = require('../../auth/auth.service');

var router = express.Router();

router.post('/addHelpContent', auth.hasRole('admin'), controller_help_content.addHelpContent);
router.get('/listHelpContents', auth.hasRole('admin'), controller_help_content.listHelpContents);
router.delete('/removeHelpContent/:id', auth.hasRole('admin'), controller_help_content.removeHelpContent);
router.get('/getHelpPostbySlug/:slug', controller_help_content.getHelpPostbySlug);

module.exports = router;
