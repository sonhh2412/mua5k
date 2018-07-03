'use strict';

var express = require('express');
var controller = require('./product.controller');
var controller_history = require('./product.historyselled');

var router = express.Router();

router.get('/get-product-category/:id', controller.getproductcategory);

router.get('/get-product-category-watting-people/:id', controller.getproductcategoryWattingPeople);

router.get('/get-product-category/:id/:brand_id', controller.getproductcategoryHasBrand);
router.get('/get-product-category-watting-people/:id/:brand_id', controller.getproductcategoryWattingPeopleHasBrand);

router.get('/get-product-category-area/:id', controller.getproductcategoryArea);
router.get('/get-product-category-area/:id/:brand_id', controller.getproductcategoryAreaHasBrand);

router.get('/get-product-category-hot/:id', controller.getproductcategoryhot);
router.get('/get-product-category-hot/:id/:brand_id', controller.getproductcategoryhotHasBrand);


router.get('/get-product-category-new/:id', controller.getproductcategorynew);
router.get('/get-product-category-new/:id/:brand_id', controller.getproductcategorynewHasBrand);

router.get('/getProductWiget/:_id', controller.getProductWiget);

router.get('/getProductHostHomePage', controller.getProductHostHomePage);

router.get('/getProductNewHomePage', controller.getProductNewHomePage);

router.get('/getSlug/:slug', controller.getSlug);

router.get('/get-product-restricted-area', controller.getProductRestrictedArea);


router.get('/get-search-like-name-watting/:name', controller.getSearchLikeNameWatting);

router.get('/get-search-like-name-watting-people/:name', controller.getSearchLikeNameWattingPeople);

router.get('/get-search-like-name-hot/:name', controller.getSearchLikeNameHot);

router.get('/get-search-like-name-new/:name', controller.getSearchLikeNameNew);

router.get('/get-search-like-name-area/:name', controller.getSearchLikeNameArea);
router.get('/product-session-selling/:id', controller.getSessionSelling);
router.get('/product-get-count-code/:_id', controller.getCountCode);

router.get('/product-get-count-code-all/:_id', controller.getCodeAll);

router.get('/session-selled-limit/:id', controller.getSessionSelled);

router.get('/listHistorySelled', controller_history.listHistorySelled);

router.get('/get-list-buy-fast/:limit', controller.getListBuyFast);

router.get('/GetHistorySellById/:id', controller_history.GetHistorySellById);

router.get('/getListProducts', controller.getListProducts);
router.get('/session-by-product/:id', controller.sessionSelectSharing);
router.get('/customers-by-session/:id/:session_id/:session_number', controller.getCustomerSharingbySession);

router.get('/get-product-lottery/:slug/:session_id', controller.getProductLottery);

router.get('/set-product-lottery/:slug/:session_id', controller.setLotteryPoductSession);

router.get('/getListWinProductByUser/:id', controller.getListWinProductByUser);
router.get('/getListProductLottery', controller.getListProductLottery);

router.get('/getCountLottery', controller.getCountLottery);


router.get('/getProductsById/:id', controller.getProductsById);

router.get('/getProductsBySlug_Session/:slug/:session_id', controller.getProductsBySlug_Session);

router.get('/getPeopleBySessionLottery/', controller.getPeopleBySessionLottery);


router.get('/get-product-result-new/:slug', controller.getProductLotteryResult);
router.get('/get-product-result-new-tmp/:slug', controller.getProductLotteryResult);

router.get('/getSessionBySearch/:id/:number', controller.getSessionBySearch);


router.get('/get-product-result-new-all', controller.getProductLotteryResultAll);
router.get('/get-product-result-new-all-tmp', controller.getProductLotteryResultAll);

router.get('/getTopProductHeader', controller.getTopProductHeader);

router.get('/getCountLotteryCategory/:slug', controller.getCountLotteryCategory);



module.exports = router;

