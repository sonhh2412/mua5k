'use strict';
angular.module('shopnxApp').directive('homeCategory', function($loading, Category, socket, $rootScope) {
    return {
        restrict: 'E',
        scope: true,
        templateUrl: 'app/homepage/views/tpl.category.html',
        link: function(scope, element, attribute) {
            Category.getCateg.query().$promise.then(function(result) {
                $rootScope.categories = result;
                setTimeout(function() {}, 100);
            });
        }
    };
}).directive('homeSlick', function($loading, Banner) {
    return {
        restrict: 'E',
        scope: true,
        templateUrl: 'app/homepage/views/tpl.slick.html',
        link: function(scope, element, attribute) {
            Banner.getListSliceBannersActive.query().$promise.then(function(result) {
                scope.list_slice_banner = result;
            });
        }
    };
}).directive('productBuyFast', function($loading, Product, $rootScope) {
    return {
        restrict: 'E',
        scope: true,
        templateUrl: 'app/homepage/views/tpl.product.buy.fast.html',
        link: function(scope, element, attribute) {
            scope.products = [];
            setTimeout(function() {
                var limit = $rootScope.isMobile ? 12 : 24;
                Product.getListBuyFast.query({limit:limit}).$promise.then(function(results) {
                    scope.products = results;
                }).catch(function(err) {
                    scope.products = [];
                });
            }, 500);
        }
    };
}).directive('homeBuyFast', function($loading, Category, $rootScope) {
    return {
        restrict: 'E',
        templateUrl: 'app/homepage/views/tpl.buy.now.html',
        link: function(scope, element, attribute) {
            Category.getCategBuyFast.query().$promise.then(function(results) {
                scope.categs = results;
            }).catch(function(err) {
                scope.categs = [];
            })
        }
    };
}).directive('homeNews', function(NewsContent) {
    return {
        restrict: 'E',
        scope: true,
        templateUrl: 'app/homepage/views/tpl.new.html',
        link: function(scope, element, attribute) {
            scope.listnews = {};
            var index = 0,
                max_index = 0,
                max = 0,
                is_scroll = false,
                fisrt_scroll = true;
            var elementScroll = angular.element(document.querySelector('.last-news'));
            NewsContent.getListNewsActive.query().$promise.then(function(result) {
                scope.listnews = result;
                max_index = _.size(scope.listnews);
            });
        }
    };
}).directive('homeProductHot', function(Product, $loading, $timeout, socket) {
    return {
        restrict: 'E',
        scope: true,
        templateUrl: 'app/homepage/views/tpl.product.hot.html',
        link: function(scope, element, attribute) {
            scope.products = [];
            Product.getProductHostHomePage.query().$promise.then(function(result) {
                scope.products = result;
            })
        }
    };
}).directive('homeProductNew', function(Product, $loading, $timeout, socket) {
    return {
        restrict: 'E',
        scope: true,
        templateUrl: 'app/homepage/views/tpl.product.new.html',
        link: function(scope, element, attribute) {
            $loading.start('lazy-product-new');
            scope.products = [];
            setTimeout(function() {
                Product.getProductNewHomePage.query().$promise.then(function(result) {
                    scope.products = result;
                    $loading.finish('lazy-product-new');
                })
            }, 700);
        }
    };
}).directive('headerTopProduct', function(Product, $loading, $timeout, socket) {
    return {
        restrict: 'E',
        scope: true,
        templateUrl: 'app/homepage/views/tpl.header.top.product.html',
        link: function(scope, element, attribute) {
            Product.getTopProductHeader.query().$promise.then(function(result) {
                scope.product = result;
                scope.selled = [];
                scope.selled[0] = '...';
                scope.selled[1] = '...';
                if (_.size(scope.product) != 0) {
                    Product.getSessionSelling.get({
                        id: scope.product[0].id
                    }).$promise.then(function(session) {
                        scope.selled[0] = session.selled;
                        Product.getSessionSelling.get({
                            id: scope.product[1].id
                        }).$promise.then(function(session) {
                            scope.selled[1] = session.selled;
                        })
                    })
                }
            })
        }
    };
})