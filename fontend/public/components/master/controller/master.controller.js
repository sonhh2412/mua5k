'use strict';
var master = angular
    .module('shopnxApp')
    .directive('mdSidenavShopping', function () {
        return {
            link       : function (scope, element, attrs) {},
            restrict   : 'E',
            templateUrl: 'components/master/views/master.user.header.html'
        }
    })
    .controller('headerController', function (
        $scope,
        $loading,
        Auth,
        $location,
        $rootScope,
        $timeout,
        $q,
        $log,
        Product,
        Cart,
        socket,
        Hook,
        SystemParameter,
        $mdDialog
    ) {
        var md = new MobileDetect(window.navigator.userAgent);        
        $rootScope.isMobile           = false;
        $rootScope.isnotMobile        = true;
        $rootScope.countWaiting   = 0;
        $rootScope.countOrder     = 0;
        $rootScope.countWallet    = 0;
        $rootScope.countNewNotify = 0;
        $rootScope.countProfile   = 0;
        var isnotifyPopup = false,
            intervalPopup;
        var list_path  = [
                '/dang-nhap.html', '/dang-ky.html', '/quen-mat-khau.html', '/ung-dung.html'
            ],
            list_cpath = ['xac-minh-tai-khoan', 'kich-hoat-email', 'kich-hoat-tin-nhan-dien-thoai', 'quen-mat-khau-nhap-ma-sms', 'thay-doi-mat-khau'];
        if (md.mobile() != null) {
            $rootScope.isMobile    = true;
            $rootScope.isnotMobile = false
        } else {
            SystemParameter.getParameterByKey({key:'domain_image_product'})
            .then(function (result){
                $rootScope.domain_image_product = result.value;
            })
            .catch(function (err){
                $rootScope.domain_image_product = $location.host();
            });
            Auth.isLoggedInAsync(function (cb) {
                $rootScope.isLoggedIn = cb;
                $rootScope.isAdmin    = Auth.isAdmin();
                cb && (
                    $rootScope.getCurrentUser = Auth.getCurrentUser(),
                    Auth.getNotifyWaitingResult({id: $rootScope.getCurrentUser._id}).then(function (results) {
                        _.each(results, function (data) {
                            if (data._id === 'waiting_result') {
                                $rootScope.countWaiting = data.count
                            } else if (data._id === 'winning_products') {
                                $rootScope.countOrder   = data.count;
                                $rootScope.countProfile = $rootScope.countOrder + $rootScope.countWallet +
                                        $rootScope.countNewNotify
                            } else if (data._id === 'my_wallet') {
                                $rootScope.countWallet  = data.count;
                                $rootScope.countProfile = $rootScope.countOrder + $rootScope.countWallet +
                                        $rootScope.countNewNotify
                            } else if (data._id === 'other') {
                                $rootScope.countNewNotify = data.count;
                                $rootScope.countProfile   = $rootScope.countOrder + $rootScope.countWallet +
                                        $rootScope.countNewNotify
                            }
                        })
                    }),
                    $scope.resetNotify        = function () {
                        Auth
                            .resetNotifyMess(
                                {_id: $rootScope.getCurrentUser._id, type: 'waiting_result'}
                            )
                            .then(function (result) {})
                    }
                )
            });
            $scope.noCacheResults = false;
            $scope.gotoCategg     = function () {
                $location.path('/danh-muc/sap-cong-bo.html')
            };
            $scope.logout         = function () {
                Auth.logout();
                $rootScope.isLoggedIn = Auth.isLoggedIn();
                $rootScope.isAdmin    = false;
                $location.path("/dang-nhap.html");
                Cart.clearItems();
                $rootScope.sizeCart       = 0;
                $rootScope.getCurrentUser = [];
                $rootScope.countWaiting   = 0;
                $rootScope.countOrder     = 0;
                $rootScope.countWallet    = 0
            };
            $rootScope.sizeCart   = _.size(Cart.idArray);
            socket
                .socket
                .on('user:save', function (data) {
                    data && $rootScope.getCurrentUser && (
                        $rootScope.getCurrentUser = $rootScope.getCurrentUser._id === data._id
                            ? data
                            : $rootScope.getCurrentUser
                    )
                });
            socket
                .socket
                .on('lottery:list_user', function (data) {
                    data && $rootScope.getCurrentUser && (
                        $rootScope.countWaiting = (data.list_user.indexOf($rootScope.getCurrentUser._id) >= 0)
                            ? $rootScope.countWaiting + 1
                            : $rootScope.countWaiting
                    )
                });
            socket
                .socket
                .on('customer:order', function (data) {
                    data && $rootScope.getCurrentUser && (
                        $rootScope.getCurrentUser._id === data.partner_id && ($rootScope.countOrder++, $rootScope.countProfile++)
                    )
                });
            socket
                .socket
                .on('customer:my_wallet', function (data) {
                    data && $rootScope.getCurrentUser && (
                        $rootScope.getCurrentUser._id === data.partner_id && ($rootScope.countWallet++, $rootScope.countProfile++),
                        Auth.refreshKNumber()
                    )
                });
            socket
                .socket
                .on('customer:new_notify', function (data) {
                    data && $rootScope.getCurrentUser && (
                        data.list_user.indexOf($rootScope.getCurrentUser._id) >= 0 && ($rootScope.countNewNotify++, $rootScope.countProfile++)
                    )
                });
            socket
                .socket
                .on('notify:resetbytype', function (data) {
                    data && $rootScope.getCurrentUser && (
                        $rootScope.getCurrentUser._id === data.id && (
                            data.type === 'waiting_result' && ($rootScope.countWaiting = 0),
                            data.type === 'winning_products' && (
                                $rootScope.countOrder   = 0,
                                $rootScope.countProfile = $rootScope.countOrder + $rootScope.countWallet +
                                    $rootScope.countNewNotify
                            ),
                            data.type === 'my_wallet' && (
                                $rootScope.countWallet  = 0,
                                $rootScope.countProfile = $rootScope.countOrder + $rootScope.countWallet +
                                    $rootScope.countNewNotify
                            ),
                            data.type === 'other' && (
                                $rootScope.countNewNotify = $rootScope.countNewNotify
                                    ? $rootScope.countNewNotify - 1
                                    : $rootScope.countNewNotify,
                                $rootScope.countProfile   = $rootScope.countOrder + $rootScope.countWallet +
                                    $rootScope.countNewNotify
                            )
                        )
                    )
                });
            $rootScope.$watch('getCurrentUser', function (user) {
                if (typeof user != 'undefined') {
                    !user.popup_first_login && user.number_k_give && (
                        intervalPopup = setInterval(function () {
                            var path = $location.path();
                            var cpath = path.split('/')[1];
                            if (list_path.indexOf(path) < 0 && list_cpath.indexOf(cpath) < 0 && !isnotifyPopup) {
                                setTimeout(function () {
                                    $mdDialog
                                        .show($mdDialog.alert().clickOutsideToClose(false).htmlContent(
                                            'Chào mừng bạn đến với Mua5K.com,<br/> Mua5K.comtặng bạn ' + user.number_k_give +
                                            'K để bắt đầu mua sắm. Chúc bạn may mắn.'
                                        ).ok('Đồng ý'))
                                        .then(function () {
                                            Auth.updateStatusNotifyLogin({
                                                id: user._id
                                            }, function (result) {})
                                        });
                                    clearInterval(intervalPopup);
                                    isnotifyPopup = false
                                }, 2000);
                                isnotifyPopup = true
                            }
                        }, 1000)
                    )
                }
            })
        }
        $scope.search   = '';
        $scope.fnSearch = function (search) {
            $location.path('/tim-kiem-san-pham/' + search + '.html')
        }
    })
    .controller('footerController', [
        '$scope',
        'socket',
        '$window',
        'Cart',
        '$rootScope',
        'Auth',
        '$location',
        '$mdDialog',
        'Lightbox',
        '$timeout',
        'Banner',
        'SystemParameter',
        '$cookieStore',
        function (
            $scope,
            socket,
            $window,
            Cart,
            $rootScope,
            Auth,
            $location,
            $mdDialog,
            Lightbox,
            $timeout,
            Banner,
            SystemParameter,
            $cookieStore
        ) {
            SystemParameter.getParameterByKey({key:'domain_image_product'})
            .then(function (result){
                $rootScope.domain_image_product = result.value;
            })
            .catch(function (err){
                $rootScope.domain_image_product = $location.host();
            });
            var md = new MobileDetect(window.navigator.userAgent);
            var isnotifyPopup = false,
                intervalPopup;
            var list_path  = [
                    '/dang-nhap.html', '/dang-ky.html', '/quen-mat-khau.html', '/ung-dung.html'
                ],
                list_cpath = ['xac-minh-tai-khoan', 'kich-hoat-email', 'kich-hoat-tin-nhan-dien-thoai', 'quen-mat-khau-nhap-ma-sms', 'thay-doi-mat-khau'];
            $rootScope.isMobile     = false;
            $rootScope.isnotMobile  = true;
            $rootScope.sizeCart = _.size(Cart.idArray);
            $scope.isBrowser     = false;
            if (md.mobile() != null) {
                if(md.userAgent() != ''){
                    $scope.isBrowser  = true;
                }
                if(md.os() == 'iOS'){
                    $scope.linkdown = 'https://itunes.apple.com/us/app/mua5k/id1230351390?ls=1&mt=8';
                    // $scope.isBrowser = false;
                }else{
                    $scope.linkdown = 'https://play.google.com/store/apps/details?id=vn.icsc.mua5k';
                }
                $scope.ClosePopupDown = function () {
                    angular.element(
                      document.querySelector('.popup-download-apps')
                    ).css({
                      'display': 'none'
                    });      
                };
                // console.log($scope.isBrowser);
                $rootScope.isMobile    = true;
                $rootScope.isnotMobile = false;
                $rootScope.tokenApp = $location.search().tokenapp;

                $rootScope.runApp = $location.search().runapp == "true";
                if($rootScope.runApp){
                    $scope.isBrowser = false;
                }
                if($rootScope.runApp && md.os() == 'iOS'){
                    $rootScope.show_social = false;
                }else{
                    $rootScope.show_social = true;
                }
               
                Auth.isLoggedInAsync(function (cb) {
                    $rootScope.isLoggedIn = cb;
                    $rootScope.isAdmin    = Auth.isAdmin();
                    cb && ($rootScope.getCurrentUser = Auth.getCurrentUser());
                    if (!cb) {
                        $rootScope.getCurrentUser          = {};
                        $rootScope.getCurrentUser.k_number = 0
                    }                    
                    
                });
                $rootScope.$watch('getCurrentUser', function (user) {
                    if (typeof user != 'undefined') {
                        Auth.isLoggedInAsync(function (cb) {
                            if(cb == true){
                                $scope.session = {};
                                $scope.session = {
                                    _id: Auth.getCurrentUser()._id,
                                };
                                var show_guide = 0;
                                if(Auth.getCurrentUser().show_guide){
                                    show_guide = Auth.getCurrentUser().show_guide;
                                }
                                // Popup huong dan
                                //$scope.favoriteCookie = $cookieStore.get('myFavorite') || "";

                                if(show_guide == 0){
                                    $scope.images = [];
                                    Banner.getListGuideMobileBannersActive.query().$promise.then(function(result) {
                                        $scope.dataguide   = [];
                                        angular.forEach(result, function(value, key){
                                            $scope.dataguide = {
                                                'url': value.image,
                                                'thumbUrl': value.image,
                                            }
                                            $scope.images.push($scope.dataguide);
                                        });
                                    });
                                    
                                    $scope.openLightboxModal = function (images) {
                                        Lightbox.openModal(images, 0);
                                    };

                                    setTimeout(function() {
                                        angular.element('#openlightboxmodal').triggerHandler('click');
                                    }, 700);

                                    //$cookieStore.put('myFavorite','true');
                                    Auth.updateShowGuide($scope.session).then(function(data) {
                                        // console.log(data);
                                    }).catch(function(err) {
                                        if (err.status == 403) $scope.errorMsg = "Change password error";
                                    });
                                }
                            };
                        });
                        !user.popup_first_login && user.number_k_give && (
                            intervalPopup = setInterval(function () {
                                var path = $location.path();
                                var cpath = path.split('/')[1];
                                if (list_path.indexOf(path) < 0 && list_cpath.indexOf(cpath) < 0 && !isnotifyPopup) {
                                    setTimeout(function () {
                                        $mdDialog
                                            .show($mdDialog.alert().clickOutsideToClose(false).htmlContent(
                                                'Chào mừng bạn đến với Mua5K.com,<br/> Mua5K.com tặng bạn ' + user.number_k_give +
                                                'K để bắt đầu mua sắm. Chúc bạn may mắn.'
                                            ).ok('Đồng ý'))
                                            .then(function () {
                                                Auth.updateStatusNotifyLogin({
                                                    id: user._id
                                                }, function (result) {})
                                            });
                                        clearInterval(intervalPopup);
                                        isnotifyPopup = false
                                    }, 2000);
                                    isnotifyPopup = true
                                }
                            }, 1000)
                        )
                    }
                });
                socket
                .socket
                .on('customer:my_wallet', function (data) {
                    data && $rootScope.getCurrentUser && (
                        Auth.refreshKNumber()
                    )
                });

                

            } else {
                $rootScope.show_social = true;
                var page = angular.element($window);
                socket
                    .socket
                    .on('send:time', function (data) {
                        $scope.time = data
                    })

                $rootScope.$watch('getCurrentUser', function (user) {
                    if (typeof user != 'undefined') {
                        Auth.isLoggedInAsync(function (cb) {                    
                            if(cb == true){
                                $scope.session = {};
                                $scope.session = {
                                    _id: Auth.getCurrentUser()._id,
                                };
                                var show_guide = 0;
                                if(Auth.getCurrentUser().show_guide){
                                    show_guide = Auth.getCurrentUser().show_guide;
                                }
                                
                                // Popup huong dan
                                // $scope.favoriteCookie = $cookieStore.get('myFavorite') || "";

                                if(show_guide == 0){
                                    $scope.images = [];
                                    Banner.getListGuideBannersActive.query().$promise.then(function(result) {
                                        $scope.dataguide   = [];
                                        angular.forEach(result, function(value, key){
                                            $scope.dataguide = {
                                                'url': value.image,
                                                'thumbUrl': value.image,
                                            }
                                            $scope.images.push($scope.dataguide);
                                        });
                                    });
                                    
                                    $scope.openLightboxModal = function (images) {
                                        Lightbox.openModal(images, 0);
                                    };

                                    setTimeout(function() {
                                        angular.element('#openlightboxmodal').triggerHandler('click');
                                    }, 700);
                                    // $cookieStore.put('myFavorite','true');
                                    Auth.updateShowGuide($scope.session).then(function(data) {
                                        //console.log(data);
                                    }).catch(function(err) {
                                        if (err.status == 403) $scope.errorMsg = "Change password error";
                                    });

                                }
                            }                   
                            
                        });
                    }
                });

                
                
            }
        }
    ]);