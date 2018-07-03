'use strict';
angular.module('shopnxApp').controller('CartCtrl', function($scope, Cart, $mdDialog, $window, Auth, $rootScope) {
    $window.scrollTo(0, 0);
    $rootScope.isHomePage = false;
    $scope.checkount_link = '#';
    $rootScope.isPageProduct = false;
    $rootScope.parmas = {
        home: false,
        waiting_result: false,
        restricted_area: false,
        customer_share: false,
        forum: false,
        productapps: false,
        aheadapps: false,
        cartapps: true,
        profileapps: false,
    };
    $scope.url = '/api/products/get-product-category-hot/0';
    $scope.cart = Cart;
    $rootScope.btnCartText = "Thanh toán đơn hàng";
    var md = new MobileDetect(window.navigator.userAgent);
    $scope.doTheBack = function() {
        window.history.back();
    };
    $scope.isMobile = false;
    $scope.isnotMobile = true;
    if (md.mobile() != null) {
        $scope.isMobile = true;
        $scope.isnotMobile = false;
    }
    $scope.changeQty = function(item, amount) {
        if (typeof item.quantity === 'undefined') {
            item.quantity = amount;
        }
        if (item.quantity != null && typeof item.quantity !== 'undefined') {
            Cart.changeQtyItem(item.quantity, item);
        }
    };
    Auth.isLoggedInAsync(function(cb) {
        $rootScope.isLoggedIn = cb;
        if (!cb) {
            $scope.loginCart = function(ev) {
                $mdDialog.show({
                    templateUrl: '/app/cart/views/login.tpl.html',
                    parent: angular.element(document.body),
                    targetEvent: ev,
                    clickOutsideToClose: true,
                    fullscreen: true
                })
            }
        }
    });
    $scope.removeItem = function(item) {
        Cart.removeItem(item);
        $rootScope.sizeCart = _.size(Cart.idArray);
    };
    $scope.removeAll = function() {
        Cart.clearItems();
        $rootScope.sizeCart = _.size(Cart.idArray);
    };
    $scope.gotoCheckout = function(k_number, total_card) {
        $scope.checkount_link = k_number < total_card ? "/dang-ky-mua-k.html" : "/xac-nhan-thanh-toan-don-hang.html";
    }
})