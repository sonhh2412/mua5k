'use strict';
angular.module('shopnxApp').controller('forgotController', function($scope, User, $loading, Auth, $mdDialog, $location, $rootScope, vcRecaptchaService, $window) {
    $rootScope.isPageProduct = false;
    $rootScope.isHomePage = false;
    $scope.session = {};
    $scope.err_sever = {};
    // $scope.model = {
    //     key: '6LceSBwUAAAAACmXbyAIhB8TQS70YEXsVdwK2-wh'
    // };
    // $scope.setResponse = function(response) {
    //     $scope.response = response
    // };
    // $scope.setWidgetId = function(widgetId) {
    //     $scope.widgetId = widgetId
    // };
    // $scope.cbExpiration = function() {
    //     vcRecaptchaService.reload($scope.widgetId);
    //     $scope.response = null
    // };
    
    $scope.submit = function() {
        // $scope.err_client_capcha = false;
        // $scope.err_sever_capcha = false;
        // if (!$scope.response) {
        //     $scope.err_client_capcha = true;
        //     $scope.err_sever_capcha = false
        // } else {
            $loading.start('lazy-submit');
            Auth.checkForgotPasswd($scope.session.email).then(function(data) {
                $scope.err_sever.token_email = false;
                if (data.provider == 'local') {
                    if (!data.isPhone) {
                        var userId = data._id;
                        Auth.sendEmailForgot(userId).then(function(rel) {
                            $mdDialog.show($mdDialog.alert().clickOutsideToClose(true).title('Thông báo.').textContent('Vui lòng kiểm tra lại email: ' + $scope.session.email + '.').ok('Trở về trang đăng nhập')).then(function() {
                                // vcRecaptchaService.reload($scope.widgetId), $scope.response = null;
                                $location.path('/dang-nhap.html')
                            });
                            $loading.finish('lazy-submit')
                        }).catch(function(err) {
                            // if (err.status === 403 && err.data === 'captcha_error') {
                            //     $scope.err_client_capcha = false;
                            //     $scope.err_sever_capcha = true;
                            //     vcRecaptchaService.reload($scope.widgetId), $scope.response = null
                            // }
                            if (err.status === 403 && err.data === 'server_email') {
                                $mdDialog.show($mdDialog.alert().clickOutsideToClose(true).title('Thông báo.').textContent('Mật khẩu của bạn không thể được vì lỗi server.').ok('Thử lại')).then(function() {
                                    // vcRecaptchaService.reload($scope.widgetId), $scope.response = null;
                                    $location.path('/quen-mat-khau.html')
                                })
                            }
                            $loading.finish('lazy-submit')
                        })
                    } else {
                        Auth.SendSmsForGotPasswd(data._id, $scope.session.email).then(function(result) {
                            // vcRecaptchaService.reload($scope.widgetId), $scope.response = null;
                            $location.path("/quen-mat-khau-nhap-ma-sms/" + result.id + ".html")
                        }).catch(function(err) {
                            // vcRecaptchaService.reload($scope.widgetId), $scope.response = null;
                            err.status === 422 && err.data === 'err_update' && ($mdDialog.show($mdDialog.alert().clickOutsideToClose(true).title('Thông báo.').textContent('Hệ thống đang bảo trì vui lòng thử lại sau.').ok('Thử lại')).then(function() {
                                $window.location.reload()
                            }));
                            err.status === 422 && err.data === 'err_sms' && ($mdDialog.show($mdDialog.alert().clickOutsideToClose(true).title('Thông báo.').textContent('Hệ thống không thế gửi mã sms cho bạn vui lòng thử lại sau.').ok('Thử lại')).then(function() {
                                $window.location.reload()
                            }));
                            err.status === 422 && err.data === 'error_sms_count' && ($mdDialog.show($mdDialog.alert().clickOutsideToClose(true).title('Thông báo.').textContent('Bạn đã yêu cầu quá 3 lần trong ngày, vui lòng đợi.').ok('Thử lại')).then(function() {
                                $window.location.reload()
                            }));
                            // if (err.status === 422 && err.data === 'captcha_error') {
                            //     $scope.err_client_capcha = false;
                            //     $scope.err_sever_capcha = true;
                            //     vcRecaptchaService.reload($scope.widgetId), $scope.response = null
                            // }
                            if (err.status === 403 && err.data === 'err_user') {
                                $scope.err_sever.token_email = true;
                                // vcRecaptchaService.reload($scope.widgetId), $scope.response = null
                            }
                            $loading.finish('lazy-submit')
                        })
                    }
                } else {
                    // vcRecaptchaService.reload($scope.widgetId), $scope.response = null;
                    $mdDialog.show($mdDialog.alert().clickOutsideToClose(true).title('Thông báo.').textContent('Địa chỉ email này được đăng nhập bằng tài khoản ' + data.provider + ', không thể đổi mật khẩu..').ok('Đóng cửa sổ')).then(function() {})
                }
            }).catch(function(err) {
                $loading.finish('lazy-submit');
                $scope.err_sever.token_email = true;
                // vcRecaptchaService.reload($scope.widgetId), $scope.response = null
            })
        // }
    }
}).controller('ChangePasswordController', function($scope, User, $loading, Auth, $mdDialog, $location, $rootScope, $stateParams) {
    $scope.session = {};
    $scope.session.password = '';
    $scope.session.rePassword = '';
    if (_.size($stateParams) > 0 && !_.isUndefined($stateParams.string) && !_.isUndefined($stateParams.id)) {
        Auth.checkHaskTringFogotPasswd($stateParams).then(function(data) {
            $scope.submit = function() {
                var data = {
                    hash: $stateParams.string,
                    id: $stateParams.id,
                    session: $scope.session
                };
                Auth.CapNhapMK(data).then(function(data) {
                    $mdDialog.show($mdDialog.alert().clickOutsideToClose(true).title('Thông báo.').textContent('Thay đổi mật khẩu thành công.').ok('Đăng nhập')).then(function() {
                        $location.path('/dang-nhap.html')
                    })
                }).catch(function(err) {
                    $mdDialog.show($mdDialog.alert().clickOutsideToClose(true).title('Thông báo.').textContent('Server đang bảo trì bui lòng thử lại sau.').ok('Đăng nhập')).then(function() {
                        $location.path('/dang-nhap.html')
                    })
                })
            }
        }).catch(function(err) {
            $location.path('/')
        })
    }
}).controller('forgoiSmsInputController', function($scope, User, $loading, Auth, $mdDialog, $location, $rootScope, $stateParams) {
    Auth.getUserbyId($stateParams.id).then(function(user) {
        $scope.submit = function() {
            Auth.SendSmsCodeForGotPasswd($stateParams.id, $scope.session.password).then(function(resut) {
                $location.path('/thay-doi-mat-khau/' + resut.hash + '/' + $stateParams.id + '.html')
            }).catch(function(err) {
                if (err.data === 'err_timeout') {
                    $mdDialog.show($mdDialog.alert().clickOutsideToClose(true).title('Thông báo.').textContent('Mã sms đã hết thời gian hiệu lực.').ok('Về trang đăng nhập')).then(function() {
                        $location.path('/dang-nhap.html')
                    })
                } else {
                    $mdDialog.show($mdDialog.alert().clickOutsideToClose(true).title('Thông báo.').textContent('Mã sms không phù hợp, vui lòng thử lại.').ok('Tắt thông báo')).then(function() {})
                }
            })
        }
    }).catch(function(err) {
        $location.path('/')
    })
});