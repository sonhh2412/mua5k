'use strict';
angular
    .module('shopnxApp')
    .controller('CheckoutCtrl', function (
        $scope,
        Cart,
        $mdDialog,
        $window,
        Auth,
        $rootScope,
        $loading,
        $location,
        Checkount
    ) {
        $rootScope.isPageProduct = false;
        $rootScope.isHomePage    = false;
        $rootScope.parmas        = {
            aheadapps      : false,
            cartapps       : true,
            customer_share : false,
            forum          : false,
            home           : false,
            productapps    : false,
            profileapps    : false,
            restricted_area: false,
            waiting_result : false
        };
        $scope.isCheckout        = true;
        $scope.cart              = Cart;
        _.size(Cart.items) === 0 && $location.path("/");
        $scope.arrListCheckout    = [];
        $scope.totalPriceCheckout = 0;
        $scope.checkout           = function () {
            $scope.isCheckout = false;
            $loading.start('lazy-checkout');
            if (_.size(Cart.items) > 0) {
                Auth.isLoggedInAsync(function (cb) {
                    $rootScope.isLoggedIn = cb;
                    !cb && $location.path('/');
                    cb && ($rootScope.getCurrentUser = Auth.getCurrentUser());
                    if ($rootScope.isLoggedIn) {
                        $rootScope.getCurrentUser = Auth.getCurrentUser();
                        var alertmsg = '', index_item = 1;
                        var cart_length = _.size(Cart.items);
                        var index_result = 1;
                    
                        var total_k_cart = 0;
                        _.each(Cart.items, function (cart, index) {
                            var numk = cart.quantity * 5;
                            total_k_cart = total_k_cart + numk;
                        });
                        
                        if(total_k_cart > $rootScope.getCurrentUser.k_number){
                            $mdDialog
                                .show(
                                    $mdDialog.alert().clickOutsideToClose(true).title('Thông báo.').textContent('Không đủ K').ok('Đồng ý')
                                )
                                .then(function () {
                                    $location.path("/dang-ky-mua-k.html");
                                });
                        }

                        Checkount
                            .checkountAllCart
                            .save(Cart.items)
                            .$promise
                            .then(function (result) {
                                // console.log(result);
                                if( _.size(result.list_error) > 0){
                                    var list_product_err = [];
                                    _.each(result.list_error, function (item, index) {
                                        list_product_err.push(item.id);
                                    });
                                    _.each(Cart.items, function (cart, index) {
                                        if(list_product_err.indexOf(cart.id_ck) !== -1) {
                                          $scope
                                            .arrListCheckout
                                            .push({
                                                buyed : 0,
                                                err   : true,
                                                image : cart.image,
                                                K     : 0,
                                                name  : cart.name,
                                                price : cart.price,
                                                slug  : cart.slug,
                                                status: "Sản phẩm ngưng bán hoặc hết phiên hoặc số mã không đủ để giao dịch"
                                            });
                                        }else{
                                            $scope
                                            .arrListCheckout
                                            .push({
                                                buyed : cart.quantity,
                                                err   : false,
                                                image : cart.image,
                                                K     : cart.quantity * 5,
                                                name  : cart.name,
                                                price : cart.price,
                                                slug  : cart.slug,
                                                status: "Đã mua thành công"
                                            });
                                        }
                                        
                                    })
                                }else{
                                    _.each(Cart.items, function (cart, index) {
                                        $scope
                                        .arrListCheckout
                                        .push({
                                            buyed : cart.quantity,
                                            err   : false,
                                            image : cart.image,
                                            K     : cart.quantity * 5,
                                            name  : cart.name,
                                            price : cart.price,
                                            slug  : cart.slug,
                                            status: "Đã mua thành công"
                                        });
                                    })
                                }
                                
                                Cart.clearItems();
                                $rootScope.sizeCart = _.size(Cart.idArray);
                                $loading.finish('lazy-checkout');
                                Auth.refreshKNumber();
                            })
                            .catch(function (err) {                                
                                if (err.data === 'Not K') {
                                    $mdDialog
                                        .show(
                                            $mdDialog.alert().clickOutsideToClose(true).title('Thông báo.').textContent('Không đủ K').ok('Đồng ý')
                                        )
                                        .then(function () {
                                            $location.path("/dang-ky-mua-k.html");
                                        });   
                                }
                                if (err.data === 'NotFoundUser') {
                                    $mdDialog
                                        .show(
                                            $mdDialog.alert().clickOutsideToClose(true).title('Thông báo.').textContent('Bạn chưa đăng nhập').ok('Đồng ý')
                                        )
                                        .then(function () {
                                            $location.path("/dang-nhap.html");
                                        });   
                                }
                                if (err.data === 'NotCart') {
                                    $mdDialog
                                        .show(
                                            $mdDialog.alert().clickOutsideToClose(true).title('Thông báo.').textContent('Chưa có sản phẩm trong giỏ hàng').ok('Đồng ý')
                                        )
                                        .then(function () {
                                            $location.path("/");
                                        });    
                                }
                            });

                        // _.each(Cart.items, function (cart, index) {
                        //     Checkount
                        //         .checkountOne
                        //         .get({product_id: cart.id_ck, qty: cart.quantity})
                        //         .$promise
                        //         .then(function (result) {
                        //             $scope
                        //                 .arrListCheckout
                        //                 .push({
                        //                     buyed : result.qty,
                        //                     err   : false,
                        //                     image : cart.image,
                        //                     K     : result.amountTotal,
                        //                     name  : cart.name,
                        //                     price : cart.price,
                        //                     slug  : cart.slug,
                        //                     status: "Đã mua thành công"
                        //                 });
                        //             $scope.totalPriceCheckout += result.amountTotal * 1000;
                        //             Cart.removeItem(cart);
                        //             $rootScope.sizeCart = _.size(Cart.idArray);
                        //             $rootScope.sizeCart === 0 && $loading.finish('lazy-checkout');
                        //             if (index_result == cart_length) {
                        //                 Auth.refreshKNumber();
                        //             }
                        //             index_result ++;
                        //         })
                        //         .catch(function (err) {
                        //             if (err.data === 'Not K') {
                        //                 $scope
                        //                     .arrListCheckout
                        //                     .push({
                        //                         buyed : 0,
                        //                         err   : true,
                        //                         image : cart.image,
                        //                         K     : 0,
                        //                         name  : cart.name,
                        //                         price : cart.price,
                        //                         slug  : cart.slug,
                        //                         status: "Không đủ K (*)"
                        //                     });
                        //                 $scope.totalPriceCheckout += 0;
                        //             } else if (err.data.messerr) {
                        //                 $scope
                        //                     .arrListCheckout
                        //                     .push({
                        //                         buyed : 0,
                        //                         err   : true,
                        //                         image : cart.image,
                        //                         K     : 0,
                        //                         name  : cart.name,
                        //                         price : cart.price,
                        //                         slug  : cart.slug,
                        //                         status: err.data.alertmsg
                        //                     });
                        //                 $scope.totalPriceCheckout += 0;
                        //             }
                        //             if (err.data === 'not_published') {
                        //                 $scope
                        //                     .arrListCheckout
                        //                     .push({
                        //                         buyed : 0,
                        //                         err   : true,
                        //                         image : cart.image,
                        //                         K     : 0,
                        //                         name  : cart.name,
                        //                         price : cart.price,
                        //                         slug  : cart.slug,
                        //                         status: "Sản phẩm ngưng bán (*)"
                        //                     });
                        //                 $scope.totalPriceCheckout += 0;
                        //             }
                        //             if (err.data === 'not_session') {
                        //                 $scope
                        //                     .arrListCheckout
                        //                     .push({
                        //                         buyed : 0,
                        //                         err   : true,
                        //                         image : cart.image,
                        //                         K     : 0,
                        //                         name  : cart.name,
                        //                         price : cart.price,
                        //                         slug  : cart.slug,
                        //                         status: "Sản phẩm hết phiên (*)"
                        //                     });
                        //                 $scope.totalPriceCheckout += 0;
                        //             }
                        //             Cart.removeItem(cart);
                        //             $rootScope.sizeCart = _.size(Cart.idArray);
                        //             $rootScope.sizeCart === 0 && $loading.finish('lazy-checkout');
                        //             if (index_result == cart_length) {
                        //                 Auth.refreshKNumber();
                        //             }
                        //             index_result ++;
                        //         });
                        //     index_item ++; 
                        // });
                    }
                });
            }
        }
    });