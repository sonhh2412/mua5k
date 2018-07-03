'use strict';
angular.module('shopnxApp').directive('productWiget', function($loading, Category, socket, Product, $timeout, Cart, $rootScope, Auth, $mdDialog) {
    return {
        restrict: 'E',
        scope: {
            height: '=height',
            product: '=product',
        },
        templateUrl: 'app/product/views/tpl.product.wiget.html',
        link: function(scope, element, attribute) {
            var flyToElement = function(flyer, flyingTo, parentElem, callBack) {
                var $func = $(this);
                var divider = 3;
                var flyerClone = flyer.clone();
                flyerClone.css({
                    position: 'absolute',
                    top: parentElem.offset().top - 50 + "px",
                    left: parentElem.offset().left + "px",
                    'z-index': 1050,
                    width: '50px',
                    'border-radius': '100%'
                });
                angular.element('body').append(flyerClone);
                var gotoX = flyingTo.offset().left + (flyingTo.width() / 2) - (flyer.width() / divider) / 2;
                var gotoY = flyingTo.offset().top + (flyingTo.height() / 2) - (flyer.height() / divider) / 2;
                flyer.hide();
                flyerClone.animate({
                    opacity: 0.7,
                    left: gotoX,
                    top: gotoY,
                    width: flyer.width() / 2,
                    height: flyer.height() / 2
                }, 1000, function() {
                    angular.element('.border-card').addClass('shakeit');
                    flyingTo.fadeOut('fast', function() {
                        flyingTo.fadeIn('fast', function() {
                            flyerClone.fadeOut('fast', function() {
                                flyerClone.remove();
                                if (callBack != null) {
                                    angular.element('.border-card').removeClass('shakeit');
                                    callBack.apply($func);
                                }
                            });
                        });
                    });
                });
            };
            scope.loadingImage = true;
            scope.domain_image_product = $rootScope.domain_image_product;
            scope.$watch('product', function(product) {
                if (typeof product._id != 'undefined') {
                    scope.product = product;
                    Product.getCodeAll.query({
                        _id: product._id
                    }).$promise.then(function(result) {
                        scope.total_code = result;
                        scope.lineTime = 0;
                        scope.lineTime = ((scope.total_code[1] / scope.total_code[0]) * 100);
                        socket.socket.on('product:buy', function(item) {
                            var promise = null;
                            scope.duration = 0;
                            item.selled === scope.total_code[0] ? (scope.total_code[1] = 0, scope.lineTime = ((scope.total_code[1] / scope.total_code[0]) * 100)) : (scope.product._id === item.product_id._id && (scope.total_code[1] = item.selled, scope.lineTime = ((scope.total_code[1] / scope.total_code[0]) * 100)));
                        });
                    }).catch(function(err) {
                        scope.total_code = [0, 0];
                    });
                    scope.product.image = _.size(scope.product.images) > 0 ? scope.domain_image_product + scope.product.images[0].image : '/assets/images/themes/10K.png';
                    console.log(scope.product.image);
                    $timeout(function() {
                        scope.loadingImage = false;
                    }, 500);
                    socket.socket.on('product:save', function(item) {
                        scope.product._id === item._id && ($loading.start('lazy-product-wiget'), scope.product = item, $timeout(function() {
                            $loading.finish('lazy-product-wiget');
                            scope.loadingImage = false;
                        }, 500));
                    });
                    scope.addToCart = function(event, product, total_code, amount) {
                        var cartElem = angular.element(document.getElementsByClassName("nav-cart-effect"));
                        var imgElem = angular.element(event.target.parentNode.parentNode.parentNode.childNodes[1].childNodes[1].childNodes[2]);
                        var parentElem = angular.element(event.target.parentNode);
                        var imgSrc = imgElem.attr('afkl-lazy-image');
                        var imgClone = angular.element('<img src="' + imgSrc + '"/>');
                        parentElem.append(imgClone);
                        (total_code[0] - total_code[1]) >= 0 && (Cart.addItem(product, 1, amount), $rootScope.sizeCart = _.size(Cart.idArray));
                        flyToElement(imgClone, cartElem, parentElem, function(callback) {
                            imgClone.remove();
                        });
                    };
                    scope.kMua = function(event, product, amount) {
                        if (!$rootScope.isLoggedIn) {
                            $mdDialog.show({
                                templateUrl: '/app/cart/views/login.tpl.html',
                                parent: angular.element(document.body),
                                targetEvent: event,
                                clickOutsideToClose: true,
                                fullscreen: true
                            })
                        } else {
                            $rootScope.product_10kmua = {
                                product: product,
                                amount: amount
                            };
                            $mdDialog.show({
                                templateUrl: '/app/cart/views/buy.product.now.html',
                                parent: angular.element(document.body),
                                targetEvent: event,
                                clickOutsideToClose: true,
                                fullscreen: true
                            })
                        }
                    }
                }
            });
        }
    }
}).directive('ngElevateZoom', function($timeout) {
    return {
        restrict: 'A',
        scope: '=product',
        link: function(scope, element, attrs) {
            var zomm = angular.element(document.querySelector('.zoomContainer'));
            zomm.remove();
            scope.$watch('product', function(newValue, oldValue) {
                if (scope.$last) {
                    attrs.$observe('zoomImage', function() {
                        linkElevateZoom();
                    });
                }

                function linkElevateZoom() {
                    if (!attrs.zoomImage) return;
                    element.attr('data-zoom-image', attrs.zoomImage);
                    $(element).elevateZoom({
                        gallery: 'gallery_01',
                        easing: true,
                        galleryActiveClass: 'active',
                        loadingIcon: '/assets/images/ajax-loader_2.gif'
                    });
                }
                $timeout((function() {
                    linkElevateZoom();
                }), 1000);
            })
        }
    };
}).directive('productSharing', function($loading, Product) {
    return {
        restrict: 'E',
        scope: {
            product: '=',
            collection: '='
        },
        link: function(scope, element, attribute) {
            scope.$watch('product', function(item) {
                if (item) {
                    Product.getProductsById.query({
                        id: item
                    }).$promise.then(function(product) {
                        scope.collection = product[0];
                    });
                }
            });
        }
    }
})