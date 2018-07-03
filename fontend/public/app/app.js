'use strict';
angular.module('shopnxApp', ['ngCookies', 'ngAlertify', 'vcRecaptcha', 'ngResource', 'ngAnimate', 'btford.socket-io', 'ngMaterialDatePicker', 'ui.router', 'slick', 'ngMaterial', 'darthwade.dwLoading', 'afkl.lazyImage', 'duScroll', 'socialLogin', 'uiRouterStyles', 'ngFileUpload', 'bgf.paginateAnything', 'countTo', 'textAngular', 'angularUtils.directives.dirPagination', 'ngScrollbars', 'angular-md5', 'djds4rce.angular-socialshare','bootstrapLightbox','ngCookies']).config(function($stateProvider, $urlRouterProvider, $locationProvider, $httpProvider, $mdAriaProvider, socialProvider, ScrollBarsProvider, LightboxProvider) {
    $urlRouterProvider.otherwise('/');
    $locationProvider.html5Mode(true);
    $httpProvider.interceptors.push('authInterceptor');
    socialProvider.setFbKey({
        appId: "376041302798981",
        apiVersion: "v2.9"
    });
    socialProvider.setGoogleKey("301745098608-kfbgsr1oo2rp7biajk3mvu6vhn861dkg.apps.googleusercontent.com");
    ScrollBarsProvider.defaults = {
        theme: 'dark',
        autoHideScrollbar: false,
        setHeight: 471,
        scrollInertia: 0,
        axis: 'yx',
        advanced: {
            updateOnContentResize: false
        },
        scrollButtons: {
            scrollAmount: 'auto',
            enable: false
        }
    };
    LightboxProvider.fullScreenMode = true;
}).factory('authInterceptor', function($rootScope, $q, $cookieStore, $location) {
    return {
        request: function(config) {
            config.headers = config.headers || {};
            if ($cookieStore.get('token')) {
                config.headers.Authorization = 'Bearer ' + $cookieStore.get('token');
            }
            return config;
        },
        responseError: function(response) {
            if (response.status === 401) {
                $location.path('/login');
                $cookieStore.remove('token');
                return $q.reject(response);
            } else {
                return $q.reject(response);
            }
        }
    };
}).factory('socket', function(socketFactory) {
    return socketFactory();
}).value('version', '0.1').run(function($rootScope, Auth, $state, User, $mdDialog, $location, $loading, $interval, $FB) {
    $rootScope.$on('$stateChangeStart', function(event, next) {});
    $rootScope.$on('$stateChangeSuccess', function(evt, toState) {
        window.document.title = 'Mua5K - ' + toState.title;
    });
    $rootScope.$on('event:social-sign-in-success', function(event, userDetails) {
        if (!userDetails.email) {
            $mdDialog.show($mdDialog.alert().clickOutsideToClose(true).title('Thông báo.').textContent('Đăng nhập không thành công. Vui lòng cung cấp địa chỉ email của bạn.').ok('Đóng cửa sổ')).then(function() {
                $loading.finish('lazy-submit');
            });
        } else {
            var user = {
                email: userDetails.email,
                avatar: userDetails.imageUrl,
                fullname: userDetails.name,
                password_input: userDetails.uid
            };
            $loading.start('lazy-submit');
            Auth.checkEmailExits(userDetails.email).then(function(result) {
                if (result.provider != userDetails.provider) {
                    if (result.provider == 'local') {
                        $mdDialog.show($mdDialog.alert().clickOutsideToClose(true).title('Thông báo.').textContent('Đăng nhập không thành công. Địa chỉ email này đã được đăng ký.').ok('Đóng cửa sổ')).then(function() {
                            $loading.finish('lazy-submit');
                        });
                    } else {
                        $mdDialog.show($mdDialog.alert().clickOutsideToClose(true).title('Thông báo.').textContent('Đăng nhập không thành công. Địa chỉ email này phải được đăng nhập bằng tài khoản ' + result.provider + ' tương ứng của bạn.').ok('Đóng cửa sổ')).then(function() {
                            $loading.finish('lazy-submit');
                        });
                    }
                } else {
                    user.id = result._id;
                    Auth.editUserbyProvider(user).then(function(data) {
                        var user_tmp = data.user;
                        Auth.login({
                            user: user_tmp.email,
                            password: user_tmp.password_input
                        }).then(function(data) {
                            Auth.isLoggedInAsync(function(cb) {
                                $rootScope.isLoggedIn = cb;
                                $rootScope.isAdmin = Auth.isAdmin();
                                cb && ($rootScope.getCurrentUser = Auth.getCurrentUser());
                                $mdDialog.show($mdDialog.alert().clickOutsideToClose(true).title('Thông báo.').textContent('Đăng nhập thành công.').ok('Đến trang chủ')).then(function() {
                                    $loading.finish('lazy-submit');
                                    $location.path('/');
                                });
                            });
                        });
                    });
                }
            }).catch(function(err) {
                user.actived = true;
                user.provider = userDetails.provider;
                Auth.createUserbyProvider(user).then(function(data) {
                    Auth.login({
                        user: data.email,
                        password: data.password_input
                    }).then(function(data) {
                        Auth.isLoggedInAsync(function(cb) {
                            $rootScope.isLoggedIn = cb;
                            $rootScope.isAdmin = Auth.isAdmin();
                            cb && ($rootScope.getCurrentUser = Auth.getCurrentUser());
                            $mdDialog.show($mdDialog.alert().clickOutsideToClose(true).title('Thông báo.').textContent('Đăng nhập thành công.').ok('Đến trang chủ')).then(function() {
                                $loading.finish('lazy-submit');
                                $location.path('/');
                            });
                        });
                    });
                });
            });
        }
    });
    $rootScope.spinner = {
        active: false,
        on: function() {
            this.active = true;
        },
        off: function() {
            this.active = false;
        }
    };
});