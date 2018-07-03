'use strict';
angular.module('shopnxApp').directive('accountMenuLeft', function($loading, $timeout, NewsContent, Auth, $location, $rootScope, socket) {
    return {
        link: function(scope, element, attribute) {
            var path = $location.path();
            scope.params = {
                friend: false,
                homeprofile: false,
                kpoint: false,
                manager: false,
                message: false,
                newnotify: false,
                productpurchase: false,
                profile: false,
                saleprofile: false,
                wallet: false
            };
            scope.isLoggedIn = false;
            Auth.isLoggedInAsync(function (cb) {
                if (cb) {
                    scope.isLoggedIn = true;
                }
            });
            if (path === '/trang-ca-nhan.html') {
                scope.params.homeprofile = true
            } else if (path === '/vi-cua-toi.html') {
                scope.params.wallet = true
            } else if (path === '/ho-so-mua-ban.html') {
                scope.params.purchaserecords = true
            } else if (path === '/don-hang-trung-thuong.html') {
                scope.params.winningproducts = true
            } else if (path === '/ho-so-cua-ban.html') {
                scope.params.profile = true
            } else if (path === '/thong-bao-moi.html') {
                scope.params.newnotify = true
            }
            //  else if (path === '/topup.html') {
            //     scope.params.topup = true
            // }
            scope.countOrder = $rootScope.countOrder;
            scope.countWallet = $rootScope.countWallet;
            $rootScope.$watch('countOrder', function(countOrder) {
                scope.countOrder = countOrder
            });
            $rootScope.$watch('countWallet', function(countWallet) {
                scope.countWallet = countWallet
            });
            $rootScope.$watch('countNewNotify', function(countNewNotify) {
                scope.countNewNotify = countNewNotify
            });
            scope.resetCountOrder = function(type_notify) {
                $rootScope.getCurrentUser && (Auth.resetNotifyMess({
                    _id: $rootScope.getCurrentUser._id,
                    type: type_notify
                }).then(function(result) {}))
            }
        },
        restrict: 'E',
        scope: {
            data: '='
        },
        templateUrl: 'app/account/views/tpl.account.left.view.html'
    }
}).directive('profileMenuLeft', function($loading, $timeout, NewsContent, Auth, $location) {
    return {
        link: function(scope, element, attribute) {
            var path = $location.path();
            scope.params = {
                avatar: false,
                profile: false,
                security: false,
                shipaddress: false
            };
            if (path === '/ho-so-cua-ban.html') {
                scope.params.profile = true
            } else if (path === '/sua-doi-avatar.html') {
                scope.params.avatar = true
            } else if (path === '/dia-chi-giao-hang.html') {
                scope.params.shipaddress = true
            } else if (path === '/thay-doi-mat-khau.html') {
                scope.params.security = true
            }
        },
        restrict: 'E',
        scope: {
            data: '='
        },
        templateUrl: 'app/account/views/tpl.profile.left.view.html'
    }
}).directive('winningProductsList', function($loading, $timeout, Product) {
    return {
        link: function(scope, element, attribute) {
            var md = new MobileDetect(window.navigator.userAgent);
            scope.isMobile = false;
            scope.isnotMobile = true;
            if (md.mobile() != null) {
                scope.isMobile = true;
                scope.isnotMobile = false
            }
            scope.$watch('iduser', function(id) {
                if (id) {
                    Product.getListWinProductByUser.query({
                        id: id
                    }).$promise.then(function(result) {
                        scope.listwinning = result
                    }).catch(function(err) {})
                }
            })
        },
        restrict: 'E',
        scope: {
            iduser: '='
        },
        templateUrl: 'app/account/views/tpl.winning.product.list.html'
    }
}).directive('totalK', function($loading, $timeout, Auth) {
    return {
        link: function(scope, element, attribute) {
            scope.$watch('iduser', function(id) {
                if (id) {
                    Auth.getTotalKById(id).then(function(result) {
                        if (result.k_number >= 0) {
                            scope.collection = result.k_number
                        } else {
                            scope.collection = 0
                        }
                    }).catch(function(err) {})
                }
            })
        },
        restrict: 'E',
        scope: {
            collection: '=',
            iduser: '='
        }
    }
});