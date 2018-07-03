'use strict';

var express = require('express');
var controller = require('./customer.sharing');
var auth = require('../../auth/auth.service');

var router = express.Router();

router.post('/addSharing', controller.addSharing);
router.get('/get-list-sharing', controller.getListSharing);
router.get('/get-list-sharing-tmp', controller.getListSharing);
router.delete('/removeSharing/:id', auth.hasRole('admin'), controller.removeSharing);
router.get('/get-sharing-by-slug/:slug', controller.getSharingContentBySlug);
router.get('/get-sharing-by-product/:id', controller.getListSharingByProduct);
router.get('/get-sharing-by-product-2/:id', controller.getListSharingByProduct);
router.post('/editSharing', controller.editSharing);
router.get('/get-sharing-by-user/:id', controller.getListSharingByUser);
router.get('/up-like-sharing', controller.UpLikeSharing);
router.post('/up-comment-sharing', controller.UpCommentSharing);
router.get('/get-comment-sharing/:id', controller.paginateCommentSharing);
router.get('/get-comment-sharing-2/:id', controller.paginateCommentSharing);
router.get('/up-view-sharing/:slug', controller.UpViewSharing);
router.get('/get-list-lotteries', controller.getListLotteries);
router.get('/get-list-session-lotteries-by-product/:id', controller.getListSessionLotteriesByProduct);
router.get('/get-number-code-user-buy', controller.getNumberCodeUserBuy);
router.get('/list-new-sharing', controller.getListNewSharing);
router.get('/getListByProduct', controller.getListByProduct);
router.get('/get-history-sharing-user/:id', controller.getHistorySharingByUser);
router.get('/getCountSharing', controller.getCountSharing);

module.exports = router;