'use strict';

var express = require('express');
var controller_cate = require('./categories.controller');
var controller_post = require('./post.controller');
var auth = require('../../auth/auth.service');

var router = express.Router();

router.post('/addCategories', auth.isAuthenticated(), controller_cate.addCategories);

router.get('/listCategories', controller_cate.listCategories);

router.get('/listCategoriesPushlic', controller_cate.listCategoriesPushlic);

router.delete('/removeCategories/:id', auth.isAuthenticated(), controller_cate.removeCategories);

router.post('/addNewPost', auth.isAuthenticated(), controller_post.addNewPost);

router.get('/listPostLast', controller_post.listPostLast);

router.get('/listPostCommon', controller_post.listPostCommon);

router.get('/listPostLastbySlug/:slug', controller_post.listPostLastbySlug);

router.get('/listPostCommonbySlug/:slug', controller_post.listPostCommonbySlug);

router.get('/getCategorybySlug/:slug', controller_cate.getCategorybySlug);

router.get('/getPostbySlug/:slug', controller_post.getPostbySlug);

router.post('/addNewComment', auth.isAuthenticated(), controller_post.addNewComment);

router.get('/countListForumbyCate/:id', controller_post.countListForumbyCate);

router.get('/getCategorybyId/:id', controller_cate.getCategorybyId);

router.get('/listPostHot', controller_post.listPostHot);

router.get('/listUserPostmost', controller_post.listUserPostmost);

router.get('/paginatePostComment/:id', controller_post.paginatePostComment);

module.exports = router;
