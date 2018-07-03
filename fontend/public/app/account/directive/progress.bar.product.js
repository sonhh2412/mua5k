'use strict';
angular.module('shopnxApp').directive('progressBarProduct', function(Product, $interval, socket, $rootScope) {
    return {
        restrict: 'E',
        scope: {
            hisitem: '='
        },
        templateUrl: 'app/account/views/progress.bar.product.html',
        link: function(scope, element, attribute) {
            scope.$watch('hisitem', function(hisitem) {
                if (typeof hisitem != undefined) {
                    Product.getProductsBySlug_Session.get({
                        slug: hisitem.product_slug,
                        session_id: hisitem.session_id
                    }).$promise.then(function(result) {
                        scope.session = result.session;
                        scope.images = $rootScope.domain_image_product + result.images[0].image;
                        scope.price = result.price;
                        scope.lineTime = 0;
                        var promise = $interval(function() {
                            scope.session.selled === 0 ? ($interval.cancel(promise)) : (scope.lineTime += 10, ((scope.session.selled / scope.session.total) * 100) <= scope.lineTime && $interval.cancel(promise))
                        }, 1);
                        scope.session.selled < scope.session.total && (socket.socket.on('product:buy', function(item) {
                            var promise = null;
                            item.selled === scope.session.total ? (scope.session.selled = 0, scope.lineTime = ((scope.session.selled / scope.session.total) * 100)) : (scope.hisitem.session_id === item.session_id && (scope.session.selled = item.selled, promise = $interval(function() {
                                scope.session.selled === 0 ? ($interval.cancel(promise)) : (scope.lineTime += 1, ((scope.session.selled / scope.session.total) * 100) <= scope.lineTime && $interval.cancel(promise))
                            }, 1)));
                        }))
                    }).catch(function(err) {
                        scope.session = false;
                    })
                }
            })
        }
    };
})