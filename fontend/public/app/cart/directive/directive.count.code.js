'use strict';
angular
    .module('shopnxApp')
    .controller(
        'cartLoginController',
        function ($scope, $mdDialog, $location, $loading, Auth, $rootScope, $window) {
            $scope.session        = {},
            $scope.show_social = $rootScope.show_social;
            $scope.cancel         = function () {
                $mdDialog.cancel();
            };
            $scope.singup         = function () {
                $mdDialog.cancel();
                $location.path('/dang-ky-tai-khoan.html');
            };
            $scope.forgotPassword = function () {
                $mdDialog.cancel();
                $location.path('/quen-mat-khau.html');
            };
            $scope.submit         = function () {
                $loading.start('lazy-submit');
                Auth
                    .getUserbyPhoneEmail($scope.session.user)
                    .then(function (result) {
                        if (result.provider == 'local') {
                            Auth
                                .login($scope.session)
                                .then(function (data) {
                                    Auth.isLoggedInAsync(function (cb) {
                                        $rootScope.isLoggedIn = cb;
                                        cb && ($rootScope.getCurrentUser = Auth.getCurrentUser());
                                        $mdDialog.cancel();
                                        $rootScope.btnCartText = "Tiếp tục thanh toán";
                                        if ($location.path().split('/')[1] === 'san-pham') {
                                            $window
                                                .location
                                                .reload();
                                        }
                                    });
                                })
                                .catch(function (err) {
                                    err.hasOwnProperty('_id')
                                        ? $location.path('/kich-hoat/' + err._id + '.html')
                                        : $scope.error = true;
                                    $loading.finish('lazy-submit');
                                });
                        } else {
                            $scope.error = true;
                            $loading.finish('lazy-submit');
                        }
                    })
                    .catch(function (err) {
                        $scope.error = true;
                        $loading.finish('lazy-submit');
                    });
            }
        }
    )
    .controller(
        'cartKMuaController',
        function ($scope, $mdDialog, $location, $loading, Auth, $rootScope, Product, Checkount) {
            $scope.session = {},
            $scope.domain_image_product = $rootScope.domain_image_product;
            $scope.cancel  = function () {
                $mdDialog.cancel();
            };
            $scope.buyK    = function () {
                $scope.cancel();
                $location.path("/dang-ky-mua-k.html");
            };
            if (typeof $rootScope.product_10kmua !== 'undefined') {
                Product
                    .getCountCode
                    .query({_id: $rootScope.product_10kmua.product._id})
                    .$promise
                    .then(function (result) {
                        $scope.product = $rootScope.product_10kmua.product;
                        $scope.count   = result[0];
                        $scope.canbuy  = result[0];
                        if ($scope.product.limited) {
                            $scope.canbuy = result[0] > 5
                                ? 5
                                : result[0];
                            Checkount
                                .getCountUserBuyInSession
                                .get({product_id: $rootScope.product_10kmua.product.id})
                                .$promise
                                .then(function (result) {
                                    $scope.canbuy = result.count >= 5
                                        ? 0
                                        : ($scope.canbuy < 5
                                            ? $scope.canbuy
                                            : 5 - result.count);
                                });
                        }
                        typeof $rootScope.product_detail_qty === 'undefined'
                            ? ($scope.qty = 1)
                            : ($rootScope.product_detail_qty.qty < $scope.count
                                ? ($scope.qty = $rootScope.product_detail_qty.qty)
                                : $scope.qty = $scope.count)
                    })
                    .catch(function (err) {
                        $scope.count = 0
                    })
                }
            $scope.changeQty = function (item, amount, product) {
                if (typeof item === 'undefined') {
                    $scope.qty = amount;
                }
            };
            $scope.checkout  = function (product_id, qty, product) {
                $loading.start('lazy-product-checkout');
                Checkount
                    .checkountOne
                    .get({product_id: product_id, qty: qty})
                    .$promise
                    .then(function (result) {
                        $scope.cancel();
                        Auth.refreshKNumber();
                        $mdDialog
                            .show(
                                $mdDialog.alert().clickOutsideToClose(true).title('Mua thành công.').htmlContent(
                                    product.name + " <br/> Số mã mua: <b class='red'>" + result.qty + " mã</b> <br/" +
                                    "> Số K đã thanh toán: <b class='red'> " + result.amountTotal + " K</b> "
                                ).ok('Đồng ý')
                            )
                            .then(function () {
                                $loading.finish('lazy-product-checkout');
                            });
                    })
                    .catch(function (err) {
                        if (err.data === 'Not K') {
                            $scope.cancel();
                            $location.path("/dang-ky-mua-k.html");
                        } else if (err.data.messerr) {
                            $loading.finish('lazy-product-checkout');
                            $scope.cancel();
                            $mdDialog
                                .show(
                                    $mdDialog.alert().clickOutsideToClose(true).title('Thông báo.').textContent(err.data.alertmsg).ok('Đồng ý')
                                )
                                .then(function () {
                                    $loading.finish('lazy-product-checkout');
                                });
                        }
                        if (err.data === 'not_published') {
                            $scope.cancel();
                            $mdDialog
                                .show(
                                    $mdDialog.alert().clickOutsideToClose(true).title('Thông báo.').textContent('Sản phẩm ngưng bán').ok('Đồng ý')
                                )
                                .then(function () {
                                    $loading.finish('lazy-product-checkout');
                                });
                        }
                        if (err.data === 'not_session') {
                            $scope.cancel();
                            $mdDialog
                                .show(
                                    $mdDialog.alert().clickOutsideToClose(true).title('Thông báo.').textContent('Sản phẩm hết phiên').ok('Đồng ý')
                                )
                                .then(function () {
                                    $loading.finish('lazy-product-checkout');
                                });
                        }
                    })
                }
        }
    )
    .directive(
        'countCode',
        function ($loading, Product, socket, $stateParams, Checkount, Cart, $rootScope) {
            return {
                link    : function (scope, element, attribute, $timeout) {
                    scope.$watch('item', function (data) {
                        if (!_.isUndefined(data)) {
                            scope.product = data.product_id;
                            scope.read    = true;
                            typeof scope.product !== 'undefined' && (
                                Product.getCountCode.query({_id: scope.product}).$promise.then(function (result) {
                                    scope.count  = result[0];
                                    scope.read   = false;
                                    scope.canbuy = scope.count === 0
                                        ? -1
                                        : scope.count;
                                    if (scope.canbuy > 0) {
                                        Checkount
                                            .findProductBy_ID
                                            .get({_id: scope.product})
                                            .$promise
                                            .then(function (result) {
                                                scope.limit_ = result.limited;
                                                if (result.limited) {
                                                    scope.canbuy = scope.canbuy > 5
                                                        ? 5
                                                        : scope.canbuy;
                                                    if ($rootScope.isLoggedIn) {
                                                        Checkount
                                                            .getCountUserBuyInSession
                                                            .get({product_id: result.id})
                                                            .$promise
                                                            .then(function (result) {
                                                                scope.canbuy = result.count >= 5
                                                                    ? 0
                                                                    : (scope.canbuy < 5
                                                                        ? scope.canbuy
                                                                        : 5 - result.count);
                                                                _.each(Cart.items, function (cart, index) {
                                                                    if (cart.product_id === scope.product) {
                                                                        Cart
                                                                            .items[index]
                                                                            .quantity = parseInt(Cart.items[index].quantity) > parseInt(scope.canbuy)
                                                                                ? parseInt(scope.canbuy)
                                                                                : parseInt(Cart.items[index].quantity);
                                                                        return;
                                                                    }
                                                                });
                                                            });
                                                    }
                                                }
                                            })
                                            .catch(function (err) {
                                                if (err.data === "not_published") {
                                                    scope.count  = 0;
                                                    scope.read   = true;
                                                    scope.canbuy = -2;
                                                    _.each(Cart.items, function (cart, index) {
                                                        if (cart.product_id === scope.product) {
                                                            Cart
                                                                .items[index]
                                                                .quantity = 0;
                                                            return;
                                                        }
                                                    });
                                                }
                                            });
                                    } else {
                                        _.each(Cart.items, function (cart, index) {
                                            if (cart.product_id === scope.product) {
                                                Cart
                                                    .items[index]
                                                    .quantity = 0;
                                                return;
                                            }
                                        });
                                    }
                                }).catch(function (err) {
                                    scope.count = 0
                                })
                            );
                        }
                    });
                },
                restrict: 'E',
                scope   : {
                    canbuy : '=',
                    count  : '=',
                    item   : '=item',
                    limit_ : '=?limit_',
                    product: '=',
                    read   : '='
                }
            };
        }
    )