'use strict';

var express = require('express');
var controller_banner = require('./banner.controller');
var auth = require('../../auth/auth.service');

var router = express.Router();

router.post('/addBanner', auth.hasRole('admin'), controller_banner.addBanner);
router.post('/editBanner', auth.hasRole('admin'), controller_banner.editBanner);
router.delete('/removeBanner/:id', auth.hasRole('admin'), controller_banner.removeBanner);
router.get('/getListSliceBanners', controller_banner.getListSliceBanners);
router.get('/getListSliceBannersActive', controller_banner.getListSliceBannersActive);
router.get('/getListBannerRights', controller_banner.getListBannerRights);
router.get('/getListBannerRightsActive', controller_banner.getListBannerRightsActive);
router.get('/getListBannerItems', controller_banner.getListBannerItems);
router.get('/getListBannerItemsActive', controller_banner.getListBannerItemsActive);
router.get('/getBannerbySlug/:slug', controller_banner.getBannerbySlug);
router.get('/getListBannerLimited', controller_banner.getListBannerLimited);
router.get('/getListBannerLimitedActive', controller_banner.getListBannerLimitedActive);
router.get('/getListGuideBanners', controller_banner.getListGuideBanners);
router.get('/getListGuideBannersActive', controller_banner.getListGuideBannersActive);
router.get('/getListGuideMobileBanners', controller_banner.getListGuideMobileBanners);
router.get('/getListGuideMobileBannersActive', controller_banner.getListGuideMobileBannersActive);
module.exports = router;