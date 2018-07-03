'use strict';
angular
    .module('shopnxApp')
    .controller(
        'ProfileCtrl',
        function ($scope, Auth, $location, Cart, $rootScope) {
            $rootScope.isPageProduct = false;
            $rootScope.isHomePage    = false;
            Auth.isLoggedInAsync(function (cb) {
                if (!cb) {
                    $location.path('/dang-nhap.html')
                } else {
                    $rootScope.session = {};
                    $rootScope.parmas  = {
                        aheadapps  : false,
                        cartapps   : false,
                        productapps: false,
                        profileapps: true
                    };
                    $rootScope.session = {
                        _id     : Auth
                            .getCurrentUser()
                            ._id,
                        avatar  : Auth
                            .getCurrentUser()
                            .avatar,
                        email   : Auth
                            .getCurrentUser()
                            .email,
                        fullname: Auth
                            .getCurrentUser()
                            .fullname,
                        numk    : Auth
                            .getCurrentUser()
                            .k_number
                    };
                    $rootScope.allcart = Cart.items;
                    var md = new MobileDetect(window.navigator.userAgent);
                    $scope.doTheBack   = function () {
                        window
                            .history
                            .back()
                    };
                    $scope.isMobile    = false;
                    $scope.isnotMobile = true;
                    if (md.mobile() != null) {
                        $scope.isMobile    = true;
                        $scope.isnotMobile = false
                    }
                    $scope.logout = function () {
                         if ($scope.isMobile) {
                            Auth.logout({tokenApp: $rootScope.tokenApp, id: Auth.getCurrentUser()._id});
                        } else {
                            Auth.logout();
                        }
                        $rootScope.isLoggedIn = Auth.isLoggedIn();
                        $rootScope.isAdmin    = false;
                        $location.path("/dang-nhap.html");
                        $rootScope.getCurrentUser = [];
                        Cart.clearItems();
                        $rootScope.sizeCart = 0
                    }
                }
            })
        }
    )
    .controller('BuyKCtrl', function (
        $scope,
        Category,
        Auth,
        $loading,
        $location,
        $http,
        $mdDialog,
        $window,
        $rootScope
    ) {
        $rootScope.isPageProduct = false;
        $rootScope.isHomePage    = false;
        Auth.isLoggedInAsync(function (cb) {
            if (!cb) {
                $location.path('/dang-nhap.html')
            } else {
                $scope.session            = {};
                $scope.session.cancel_url = $location.absUrl();
                $scope.session.receiver   = 'mua5k.com@gmail.com';
                $scope.session.product    = 'DH' + Date.now();
                $scope.session.fullname   = Auth
                    .getCurrentUser()
                    .fullname;
                $scope.session.email      = Auth
                    .getCurrentUser()
                    .email;
                $scope.session.phone      = Auth
                    .getCurrentUser()
                    .telephone;
                $scope.session.comments   = 'Thong tin don hang ' + $scope.session.product +
                        ' | ' + Auth
                    .getCurrentUser()
                    .fullname + ' | ' + Auth
                    .getCurrentUser()
                    .email + ' | ' + Auth
                    .getCurrentUser()
                    .telephone;

                $scope.session.option_payment = 'NL';
                $scope.select             = function (item) {
                    $scope.session.option_payment = item;
                    $scope.selected = item
                };
               
                $scope.isSelected         = function (item) {
                    return $scope.selected == item
                };
                var md = new MobileDetect(window.navigator.userAgent);
                
                $scope.doTheBack   = function () {
                    window
                        .history
                        .back()
                };
                $scope.isMobile    = false;
                $scope.isnotMobile = true;
                if (md.mobile() != null) {
                    $scope.isMobile    = true;
                    $scope.isnotMobile = false
                }

                $scope.submit                = function () {
                    if (!$scope.session.bankcode && $scope.session.option_payment != 'NL' && $scope.session.option_payment != 'CREDIT_CARD_PREPAID') {
                        $scope.showalert = true
                    } else {
                        $loading.start('lazy-submit');
                        $scope.session.price = $scope.session.price != 'other'
                            ? $scope.session.price
                            : $scope.session.Otherprice * 1000;
                        $scope.session._id   = Auth
                            .getCurrentUser()
                            ._id;
                        Auth
                            .BuyK($scope.session)
                            .then(function (result) {
                                $window.location.href = result.url
                            })
                            .catch(function (err) {})
                        }
                };
                $scope.session_card          = {};
                $scope.session_card.cardCode = 'VIETTEL';
                $scope.submitTC              = function () {
                    $loading.start('lazy-submit');
                    Auth
                        .napCard($scope.session_card)
                        .then(function (result) {
                            Auth.refreshKNumber();
                            $mdDialog
                                .show($mdDialog.alert().clickOutsideToClose(true).htmlContent(
                                    "<div><h3 class='text-center m-0 p-9 text-cap' style='font-size: 20px;'>Thông b" +
                                    "áo về nạp K thông qua thẻ cào.</h3><p style='font-size: 17px; text-align: cent" +
                                    "er' class='m-0 m-t-15'>Mệnh giá thẻ cào bạn nạp: <b class='red'>" + result.card_money +
                                    " đ</b>.<p><p style='font-size: 17px; text-align: center' class='m-0 m-t-15'>Số" +
                                    " K được cộng vào tài khoản: <b class='red'>" + result.k_result + "K</b>.<p></d" +
                                    "iv>"
                                ).ok('Ok'))
                                .then(function () {
                                    $loading.finish('lazy-submit');
                                    Auth.isLoggedInAsync(function (cb) {
                                        $rootScope.isLoggedIn = cb;
                                        $rootScope.isAdmin    = Auth.isAdmin();
                                        cb && ($rootScope.getCurrentUser = Auth.getCurrentUser())
                                    })
                                })
                        })
                        .catch(function (err) {
                            if (err.status === 403) {
                                $mdDialog.show($mdDialog.alert().clickOutsideToClose(true).htmlContent(
                                    "<div><h3 class='text-center m-0 p-9' style='font-size: 17px; text-transform: c" +
                                    "apitalize;'>Thông báo về nạp K thông qua thẻ cào.</h3><p style='font-size: 20p" +
                                    "x; text-align: center' class='red m-0 m-t-15'>" + err.data + ".<p></div>"
                                ).ok('Ok'))
                            } else {
                                if (err.status === 402) {
                                    $mdDialog.show($mdDialog.alert().clickOutsideToClose(true).htmlContent(
                                        "<div><h3 class='text-center m-0 p-9' style='font-size: 17px; text-transform: c" +
                                        "apitalize;'>Thông báo về nạp K thông qua thẻ cào.</h3><p style='font-size: 20p" +
                                        "x; text-align: center' class='red m-0 m-t-15'>Đã xảy ra lỗi vui lòng liên hệ v" +
                                        "ới admin. thẻ cào không thể lưu dữ liệu vào hệ thống.<p></div>"
                                    ).ok('Ok'))
                                }
                            }
                            $loading.finish('lazy-submit')
                        })
                    }
            }
        })
    })
    .controller(
        'ResultBuyKCtrl',
        function ($scope, Category, Auth, $location, $rootScope) {
            $rootScope.isPageProduct = false;
            $rootScope.isHomePage    = false;
            
           
            var error_code = $location
                .search()
                .error_code;
            var token = $location
                .search()
                .token;
            // var error_code = '00';
            // var token = '10505911-f4f7fd62984d87108a9e01e7dcacebd3';
            var msg_alert = '';
            var msg_err = '';
            if (error_code == '00') {
                Category
                    .ReturnBuyK
                    .get({token: token})
                    .$promise
                    .then(function (result) {
                        if (result.msg_status === true) {
                            Auth.refreshKNumber();
                            msg_alert = 'Mua K thành công. Cảm ơn bạn đã tin tưởng sử dụng dịch vụ của chúng tôi'
                        } else {
                            msg_alert = 'Giao dịch này của bạn đã tồn tại '
                        }
                        $scope.alertMsg = msg_alert
                    })
            } else {
                msg_err         = 'Giao dịch không thành công. Bạn vui lòng kiểm tra lại đơn hàng.';
                $scope.alertErr = msg_err
            }
        }
    )
    .controller(
        'PurchaseRecordsCtrl',
        function ($scope, Auth, $location, Product, $rootScope) {
            $rootScope.isPageProduct = false;
            $rootScope.isHomePage    = false;
            Auth.isLoggedInAsync(function (cb) {
                if (!cb) {
                    $location.path('/dang-nhap.html')
                } else {
                    $scope.urlHistoryPage  = '/api/products/GetHistorySellById/' + Auth
                        .getCurrentUser()
                        ._id;
                    $scope.session         = {};
                    $scope.listhistorysell = {};
                    $scope.session         = {
                        history_oder    : Auth
                            .getCurrentUser()
                            .history_oder,
                        history_transfer: Auth
                            .getCurrentUser()
                            .history_transfer,
                        history_topup   : Auth
                            .getCurrentUser()
                            .history_topup,
                        numk            : Auth
                            .getCurrentUser()
                            .k_number
                    };
                    var md = new MobileDetect(window.navigator.userAgent);
                    $scope.doTheBack   = function () {
                        window
                            .history
                            .back()
                    };
                    $scope.isMobile    = false;
                    $scope.isnotMobile = true;
                    if (md.mobile() != null) {
                        $scope.isMobile    = true;
                        $scope.isnotMobile = false
                    }
                    $scope.MsgNull = false;
                    Product
                        .GetHistorySellById
                        .query({
                            id: Auth
                                .getCurrentUser()
                                ._id
                        })
                        .$promise
                        .then(function (result) {
                            $scope.listhistorysell = result
                        })
                        .catch(function (err) {
                            if (err.data.count == 0) {
                                $scope.MsgNull = true
                            }
                        })
                    }
            })
        }
    )
    .controller('CustomerProfileCtrl', function (
        $scope,
        Auth,
        Category,
        $location,
        $stateParams,
        Product,
        CustomerSharing,
        $rootScope
    ) {
        $rootScope.isPageProduct  = false;
        $rootScope.isHomePage     = false;
        $scope.userinfo           = {};
        $scope.pathlink           = {};
        $scope.listhistorysell    = {};
        $scope.listhistorysharing = {};
        $scope.session            = {};
        Auth.isLoggedInAsync(function (cb) {
            if (cb) {
                $scope.session.id_login = Auth
                    .getCurrentUser()
                    ._id
            }
        });
        $scope.session.id_user = $stateParams.id;
        $scope.urlHistoryPage  = '/api/products/GetHistorySellById/' +
                $stateParams.id;
        $scope.pathlink        = $location.absUrl();
        Auth
            .GetCustomById($scope.session)
            .then(function (result) {
                $scope.userinfo = result
            })
            .catch(function (err) {});
        var md = new MobileDetect(window.navigator.userAgent);
        $scope.doTheBack   = function () {
            window
                .history
                .back()
        };
        $scope.isMobile    = false;
        $scope.isnotMobile = true;
        if (md.mobile() != null) {
            $scope.isMobile    = true;
            $scope.isnotMobile = false
        }
        Product
            .GetHistorySellById
            .query({id: $stateParams.id})
            .$promise
            .then(function (result) {
                $scope.listhistorysell = result
            });
        CustomerSharing
            .getHistorySharingByUser
            .query({id: $stateParams.id})
            .$promise
            .then(function (result) {
                $scope.listhistorysharing = result
            })
    })
    .controller(
        'TransferKCtrl',
        function ($scope, Auth, $location, $mdDialog, $rootScope) {
            $rootScope.isPageProduct = false;
            $rootScope.isHomePage    = false;
            Auth.isLoggedInAsync(function (cb) {
                if (!cb) {
                    $location.path('/dang-nhap.html')
                } else {
                    var md = new MobileDetect(window.navigator.userAgent);
                    $scope.doTheBack   = function () {
                        window
                            .history
                            .back()
                    };
                    $scope.isMobile    = false;
                    $scope.isnotMobile = true;
                    if (md.mobile() != null) {
                        $scope.isMobile    = true;
                        $scope.isnotMobile = false
                    };
                    $scope.session    = {};
                    $scope.session.id = Auth
                        .getCurrentUser()
                        ._id;
                    var emailuser = Auth
                        .getCurrentUser()
                        .email;
                    $scope.MsgNotaccount = false;
                    $scope.MsgEnoughK    = false;
                    $scope.submit        = function () {
                        $scope.dialogConfirm = $mdDialog
                            .confirm()
                            .clickOutsideToClose(true)
                            .title('Thông báo')
                            .htmlContent(
                                '\"Tài khoản ' + emailuser + ' chuyển ' + $scope.session.numberk + 'K tới tài k' +
                                'hoản ' + $scope.session.email + '<br/>Nội dung: ' + $scope.session.contenttransferk +
                                '\"<br/>Bạn có chắc chắn không?'
                            )
                            .ok('Chuyển')
                            .cancel('Quay lại');
                        $mdDialog
                            .show($scope.dialogConfirm)
                            .then(function (result) {
                                Auth
                                    .ChuyenK($scope.session)
                                    .then(function (result) {
                                        Auth.refreshKNumber();
                                        $mdDialog
                                            .show(
                                                $mdDialog.alert().clickOutsideToClose(true).title('Thông báo.').textContent('Giao dịch của bạn đã được thực hiện.').ok('Ok')
                                            )
                                            .then(function () {
                                                $location.path('/trang-ca-nhan.html')
                                            })
                                    })
                                    .catch(function (err) {
                                        if (err.data.messerr == 1) {
                                            $scope.MsgNotaccount = true
                                        }
                                        if (err.data.messerr == 2) {
                                            $scope.MsgEnoughK    = true;
                                            $scope.MsgNotaccount = false
                                        }
                                    })
                                }, function () {})
                    }
                }
            })
        }
    )
    .controller(
        'WinningProductsCtrl',
        function ($scope, Auth, $location, $rootScope) {
            $rootScope.parmas        = {
                aheadapps  : false,
                cartapps   : false,
                home       : false,
                productapps: false,
                profileapps: true
            };
            $rootScope.isPageProduct = false;
            $rootScope.isHomePage    = false;
            Auth.isLoggedInAsync(function (cb) {
                if (!cb) {
                    $location.path('/dang-nhap.html')
                } else {
                    $scope.session    = {};
                    $scope.session.id = Auth
                        .getCurrentUser()
                        ._id;
                    var md = new MobileDetect(window.navigator.userAgent);
                    $scope.doTheBack   = function () {
                        window
                            .history
                            .back()
                    };
                    $scope.isMobile    = false;
                    $scope.isnotMobile = true;
                    if (md.mobile() != null) {
                        $scope.isMobile    = true;
                        $scope.isnotMobile = false
                    }
                }
            })
        }
    )
    .controller(
        'DetailProfileCtrl',
        function ($scope, Auth, $location, $rootScope) {
            $rootScope.isPageProduct = false;
            $rootScope.isHomePage    = false;
            Auth.isLoggedInAsync(function (cb) {
                if (!cb) {
                    $location.path('/dang-nhap.html')
                } else {
                    $scope.session    = {};
                    $rootScope.parmas = {
                        aheadapps  : false,
                        cartapps   : false,
                        productapps: false,
                        profileapps: true
                    };
                    $scope.session    = {
                        _id      : Auth
                            .getCurrentUser()
                            ._id,
                        avatar   : Auth
                            .getCurrentUser()
                            .avatar,
                        email    : Auth
                            .getCurrentUser()
                            .email,
                        fullname : Auth
                            .getCurrentUser()
                            .fullname,
                        gender   : Auth
                            .getCurrentUser()
                            .gender,
                        street   : Auth
                            .getCurrentUser()
                            .street,
                        telephone: Auth
                            .getCurrentUser()
                            .telephone
                    };
                    var md = new MobileDetect(window.navigator.userAgent);
                    $scope.doTheBack   = function () {
                        window
                            .history
                            .back()
                    };
                    $scope.isMobile    = false;
                    $scope.isnotMobile = true;
                    if (md.mobile() != null) {
                        $scope.isMobile    = true;
                        $scope.isnotMobile = false
                    }
                }
            })
        }
    );