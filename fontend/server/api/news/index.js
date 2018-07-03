'use strict';

var express = require('express');
var controller_news = require('./news.controller');
var auth = require('../../auth/auth.service');

var router = express.Router();

router.post('/addNews', auth.hasRole('admin'), controller_news.addNews);
router.get('/getListNews', auth.hasRole('admin'), controller_news.getListNews);
router.delete('/removeNews/:id', auth.hasRole('admin'), controller_news.removeNews);
router.post('/editNews', auth.hasRole('admin'), controller_news.editNews);
router.get('/getNewsbySlug/:slug', controller_news.getNewsbySlug);
router.get('/getListNewsActive', controller_news.getListNewsActive);
router.get('/getTopNews', controller_news.getTopNews);
router.get('/listNewsActived', controller_news.listNewsActived);

module.exports = router;