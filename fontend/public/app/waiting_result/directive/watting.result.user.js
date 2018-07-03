'use strict';
angular.module('shopnxApp').directive('infoUserWinner', function(Auth, Product) {
    return {
        restrict: 'E',
        scope: {
            product: '='
        },
        templateUrl: 'app/waiting_result/views/watting.result.user.html',
        link: function(scope, element, attribute, $timeout) {
            scope.$watch('product', function(data) {
                if (typeof data != 'undefined') {
                    scope.data = data;
                    _.size(data.product.user_win) > 0 && (Auth.getUserbyId(data.product.user_win[0]._id).then(function(user) {
                    	console.log(typeof user.region);
                    	user.region == 'undefined' && (user.region = '');
                        scope.user = user;
                    }));
                    Product.getPeopleBySessionLottery.query({
                        product_id: data.product.id,
                        session_id: data.product.session_id
                    }).$promise.then(function(result) {
                        if (result.length > 0) {
                            scope.count_people = result[0].count;
                        }
                    })
                }
            });
        }
    };
}).directive('resultTimerCount', function($loading, Product, socket, $rootScope, Hook, $interval, $stateParams) {
    return {
        restrict: 'E',
        scope: {
            product: '=',
        },
        templateUrl: 'app/waiting_result/views/timer.result.html',
        link: function(scope, element, attribute) {
            scope.$watch('product', function(product) {
                if (typeof product != 'undefined') {
                    typeof scope.product.timer != 'undefined' && $interval.cancel(scope.product.timer);
                    scope.timer = {
                        minutes: "00",
                        seconds: "00",
                        milliSeconds: "00"
                    };
                    if (parseInt(scope.product.second_product) > 0) {
                        var expires = new Date();
                        expires.setSeconds(expires.getSeconds() + parseInt(scope.product.second_product));
                        scope.product.timer = null;
                        scope.product.timer = $interval(function() {
                            var timeDiff = expires - new Date();
                            if (timeDiff <= 0) {
                                $interval.cancel(scope.product.timer);
                                scope.timer = {
                                    minutes: "00",
                                    seconds: "00",
                                    milliSeconds: "00"
                                };
                                if (scope.product.second_product != 0) {
                                    Product.getProductLottery.get({
                                        'slug': product.product.slug,
                                        'session_id': product.product.session_id
                                    }).$promise.then(function(result) {
                                        scope.product = {
                                            product: result.result,
                                            second_product: 0
                                        };
                                    });
                                }
                                scope.product.second_product = 0;
                                return;
                            }
                            var dateDiff = new Date(timeDiff);
                            var minutes = new Date(timeDiff).getMinutes();
                            var seconds = new Date(timeDiff).getSeconds();
                            var milliSeconds = (new Date(timeDiff).getMilliseconds() / 10).toFixed(0);
                            minutes = minutes < 10 ? "0" + minutes : minutes;
                            seconds = seconds < 10 ? "0" + seconds : seconds;
                            milliSeconds = milliSeconds < 10 ? "0" + milliSeconds : milliSeconds;
                            scope.timer = minutes + " : " + seconds + " : " + milliSeconds;
                            scope.timer = {
                                minutes: minutes,
                                seconds: seconds,
                                milliSeconds: milliSeconds
                            };
                        }, 1);
                    }
                }
            })
        }
    };
})