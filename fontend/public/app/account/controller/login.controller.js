'use strict';
angular.module('shopnxApp').controller('loginControler', function($scope, $loading, Auth, $location, $rootScope) {
    $rootScope.isPageProduct = false;
    $rootScope.isHomePage = false;
    $scope.session = {};
    var md = new MobileDetect(window.navigator.userAgent);
    $scope.submit = function() {
        $loading.start('lazy-submit');
        Auth.getUserbyPhoneEmail($scope.session.user).then(function(result) {
            if (result.provider == 'local') {
            	if (md.mobile() != null) {
                	$scope.session.tokenApp = $rootScope.tokenApp;
                }
                Auth.login($scope.session).then(function(data) {
                    Auth.isLoggedInAsync(function(cb) {
                        $rootScope.isLoggedIn = cb;
                        $rootScope.isAdmin = Auth.isAdmin();
                        cb && ($rootScope.getCurrentUser = Auth.getCurrentUser(), Auth.getNotifyWaitingResult({
                            id: $rootScope.getCurrentUser._id
                        }).then(function(results) {
                            _.each(results, function(data) {
                                if (data._id === 'waiting_result') {
                                    $rootScope.countWaiting = data.count;
                                    return;
                                }
                            });
                        }));
                        $location.path('/');
                    });
                }).catch(function(err) {
                    err.hasOwnProperty('_id') ? $location.path('/kich-hoat/' + err._id + '.html') : $scope.error = true;
                    $loading.finish('lazy-submit');
                });
            } else {
                $scope.error = true;
                $loading.finish('lazy-submit');
            }
        }).catch(function(err) {
            $scope.error = true;
            $loading.finish('lazy-submit');
        });;
    }
});