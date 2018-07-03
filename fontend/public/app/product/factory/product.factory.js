'use strict'; angular.module('shopnxApp') .factory('Product', ['$resource', function($resource) {return {getproductcategory : $resource('/api/products/getproductcategory/:id', null, {'getproductcategory': { method:'PUT'}}), getProductWiget : $resource('/api/products/getProductWiget/:_id', null, {'getProductWiget': { method:'PUT'}}), getProductHostHomePage : $resource('/api/products/getProductHostHomePage', null, {'getProductHostHomePage': { method:'PUT'}}), getProductNewHomePage : $resource('/api/products/getProductNewHomePage', null, {'getProductNewHomePage': { method:'PUT'}}), getSlug : $resource('/api/products/getSlug/:slug', null, {'getSlug': { method:'PUT'}}), getSessionSelling : $resource('/api/products/product-session-selling/:id', null, {'getSessionSelling': { method:'PUT'}}), getCountCode : $resource('/api/products/product-get-count-code/:_id', null, {'getCountCode': { method:'PUT'}}), getCodeAll : $resource('/api/products/product-get-count-code-all/:_id', null, {'getCodeAll': { method:'PUT'}}), getSessionSelled : $resource('/api/products/session-selled-limit/:id', null, {'getSessionSelled': { method:'PUT'}}), listHistorySelled : $resource('/api/products/listHistorySelled', null, {'listHistorySelled': { method:'PUT'}}), GetHistorySellById : $resource('/api/products/GetHistorySellById/:id', null, {'GetHistorySellById': { method:'PUT'}}), getListBuyFast : $resource('/api/products/get-list-buy-fast/:limit', null, {'getListBuyFast': { method:'PUT'}}), getListProducts: $resource('/api/products/getListProducts', null, {'getListProducts': {method:'PUT'}}), sessionSelectSharing: $resource('/api/products/session-by-product/:id', null, {'sessionSelectSharing': {method:'PUT'}}), getCustomerSharingbySession: $resource('/api/products/customers-by-session/:id/:session_id/:session_number', null, {'getCustomerSharingbySession': {method:'PUT'}}), getProductLottery : $resource('/api/products/get-product-lottery/:slug/:session_id', null, {'getProductLottery': { method:'PUT'}}), setLotteryPoductSession : $resource('/api/products/set-product-lottery/:slug/:session_id', null, {'setLotteryPoductSession': { method:'PUT'}}), getListWinProductByUser : $resource('/api/products/getListWinProductByUser/:id', null, {'getListWinProductByUser': { method:'PUT'}}), getListProductLottery : $resource('/api/products/getListProductLottery', null, {'getListProductLottery': { method:'PUT'}}), getCountLottery : $resource('/api/products/getCountLottery', null, {'getCountLottery': { method:'PUT'}}), getProductsById : $resource('/api/products/getProductsById/:id', null, {'getProductsById': {method: 'PUT'}}), getProductsBySlug_Session : $resource('/api/products/getProductsBySlug_Session/:slug/:session_id', null, {'getProductsBySlug_Session': {method: 'PUT'}}), getPeopleBySessionLottery : $resource('/api/products/getPeopleBySessionLottery', null, {'getPeopleBySessionLottery': {method: 'PUT'}}), getSessionBySearch : $resource('/api/products/getSessionBySearch/:id/:number', null, {'getSessionBySearch': {method: 'PUT'}}), getTopProductHeader : $resource('/api/products/getTopProductHeader', null, {'getTopProductHeader': {method: 'PUT'}}), getCountLotteryCategory : $resource('/api/products/getCountLotteryCategory/:slug', null, {'getCountLotteryCategory': {method: 'PUT'}}), } }])