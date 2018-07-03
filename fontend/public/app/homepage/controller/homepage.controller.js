'use strict';
angular.module('shopnxApp').controller('homepageCtrl', function($scope, Product, $rootScope, Banner, $interval, socket) {
    $rootScope.isPageProduct = false;
    Product.getListProductLottery.query().$promise.then(function(result) {
        $scope.products = result;
        var move = angular.element(document.querySelector(".move-result"));
        $scope.first = true;
        $scope.marginTmp = null;
        var timeOut = null;
        $rootScope.isHomePage = true;
        if ($rootScope.isHomePage = true) {
            $interval(function() {
                Product.getListProductLottery.query().$promise.then(function(result) {
                    if (!_.isEqual(_.map(result, function(value) {
                            return value.product.session_id
                        }), _.map($scope.products, function(value) {
                            return value.product.session_id
                        }))) {
                        if ($scope.first) {
                            $scope.marginTmp = -238;
                            $scope.first = false;
                            $scope.products = result;
                            move.css({
                                'margin-left': $scope.marginTmp
                            }), timeOut = $interval(function() {
                                $scope.marginTmp < 0 ? (move.css({
                                    'margin-left': $scope.marginTmp
                                }), $scope.marginTmp += 7, $scope.first = false) : (move.css({
                                    'margin-left': 0
                                }), $interval.cancel(timeOut), $scope.first = true)
                            }, 1);
                        }
                    }
                });
            }, 20000);
        }
    });
    $scope.result_number = {
        number: 0
    };
    Product.getCountLottery.get().$promise.then(function(result) {
        $scope.result_number = result;
    });
    socket.socket.on("product:hook_refresh_number", function(number) {
        $scope.result_number.number = number;
    });
    var md = new MobileDetect(window.navigator.userAgent);
    $scope.isMobile = false;
    $scope.isnotMobile = true;
    $rootScope.parmas = {
        home: true,
        waiting_result: false,
        restricted_area: false,
        customer_share: false,
        forum: false,
    };
    $scope.list_banner_right = {};
    Banner.getListBannerRightsActive.query().$promise.then(function(result) {
        $scope.list_banner_right = result;
    });
    Banner.getListBannerItemsActive.query().$promise.then(function(result) {
        $scope.list_banner_item = result;
    });
})